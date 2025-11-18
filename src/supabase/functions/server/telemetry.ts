/**
 * OpenTelemetry configuration and utilities
 * Provides optional OTLP exporter for distributed tracing
 */

// Type definitions for minimal OpenTelemetry support without full imports
interface Span {
  end(): void
  recordException?(exception: any): void
  setAttribute?(key: string, value: string | number | boolean): void
  setStatus?(status: { code: number; message?: string }): void
}

interface Tracer {
  startSpan(name: string, options?: any): Span
}

interface Trace {
  getTracer(name: string, version?: string): Tracer
}

let tracerInstance: Tracer | null = null
let otlpExporterInitialized = false

/**
 * Initialize OpenTelemetry with optional OTLP exporter
 * Call this once at startup
 */
export async function initializeOpenTelemetry(): Promise<void> {
  const otlpEndpoint = Deno.env.get('OTLP_ENDPOINT')
  const serviceName = Deno.env.get('OTEL_SERVICE_NAME') || 'symbi-resonate'
  
  try {
    // Import OpenTelemetry API
    const ot = await import('npm:@opentelemetry/api@1.7.0').catch(() => null)
    if (!ot || !ot.trace) {
      console.log('OpenTelemetry API not available')
      return
    }

    // If OTLP endpoint is configured, set up full tracing with exporter
    if (otlpEndpoint && !otlpExporterInitialized) {
      try {
        const { NodeTracerProvider } = await import('npm:@opentelemetry/sdk-trace-node@1.19.0')
        const { OTLPTraceExporter } = await import('npm:@opentelemetry/exporter-trace-otlp-http@0.46.0')
        const { BatchSpanProcessor } = await import('npm:@opentelemetry/sdk-trace-base@1.19.0')
        const { Resource } = await import('npm:@opentelemetry/resources@1.19.0')
        const { SemanticResourceAttributes } = await import('npm:@opentelemetry/semantic-conventions@1.19.0')

        const exporter = new OTLPTraceExporter({
          url: otlpEndpoint,
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const provider = new NodeTracerProvider({
          resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
          }),
        })

        provider.addSpanProcessor(new BatchSpanProcessor(exporter))
        provider.register()

        tracerInstance = provider.getTracer(serviceName, '1.0.0')
        otlpExporterInitialized = true
        
        console.log(`OpenTelemetry initialized with OTLP exporter: ${otlpEndpoint}`)
      } catch (error) {
        console.warn('Failed to initialize OTLP exporter:', error)
        // Fallback to basic tracer
        tracerInstance = ot.trace.getTracer(serviceName, '1.0.0')
      }
    } else {
      // Use basic tracer without exporter
      tracerInstance = ot.trace.getTracer(serviceName, '1.0.0')
      console.log('OpenTelemetry initialized (no OTLP exporter)')
    }
  } catch (error) {
    console.warn('OpenTelemetry initialization failed:', error)
  }
}

/**
 * Run a function with an OpenTelemetry span
 * Automatically records exceptions and sets span status
 */
export async function runWithSpan<T>(
  name: string,
  fn: () => Promise<T> | T,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  // If no tracer is initialized, run without tracing
  if (!tracerInstance) {
    return await fn()
  }

  const span = tracerInstance.startSpan(name)
  
  try {
    // Add custom attributes if provided
    if (attributes && span.setAttribute) {
      for (const [key, value] of Object.entries(attributes)) {
        span.setAttribute(key, value)
      }
    }

    const result = await fn()
    
    // Set success status
    if (span.setStatus) {
      span.setStatus({ code: 1 }) // SpanStatusCode.OK = 1
    }
    
    span.end()
    return result
  } catch (error) {
    // Record exception
    if (span.recordException) {
      span.recordException(error as any)
    }
    
    // Set error status
    if (span.setStatus) {
      span.setStatus({ 
        code: 2, // SpanStatusCode.ERROR = 2
        message: String(error)
      })
    }
    
    span.end()
    throw error
  }
}

/**
 * Extract trace context from HTTP headers
 * Returns traceparent header value or generates a new trace ID
 */
export function extractTraceContext(headers: Record<string, string | undefined>): {
  traceparent: string
  traceId: string
} {
  const traceparent = headers['traceparent'] || headers['Traceparent'] || ''
  
  if (traceparent) {
    // Extract trace ID from W3C traceparent format: version-traceId-spanId-flags
    const parts = traceparent.split('-')
    const traceId = parts[1] || crypto.randomUUID()
    return { traceparent, traceId }
  }
  
  // Generate new trace ID if no traceparent header
  const traceId = crypto.randomUUID()
  return { 
    traceparent: `00-${traceId}-${crypto.randomUUID().substring(0, 16)}-01`,
    traceId 
  }
}

/**
 * Create span attributes from request context
 */
export function createSpanAttributes(context: {
  method?: string
  path?: string
  tenantId?: string
  userId?: string
  role?: string
}): Record<string, string> {
  const attributes: Record<string, string> = {}
  
  if (context.method) attributes['http.method'] = context.method
  if (context.path) attributes['http.target'] = context.path
  if (context.tenantId) attributes['tenant.id'] = context.tenantId
  if (context.userId) attributes['user.id'] = context.userId
  if (context.role) attributes['user.role'] = context.role
  
  return attributes
}
