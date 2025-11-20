/**
 * Privacy and Compliance Module
 * Handles PII detection, anonymization, and data retention
 */

import { PrivacyConfig } from './types';

/**
 * PII Detection and Anonymization
 */
export class PrivacyManager {
  private piiPatterns: RegExp[] = [
    // Email addresses
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    // Phone numbers (US format)
    /\b\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    // Social Security Numbers
    /\b\d{3}-\d{2}-\d{4}\b/g,
    // Credit card numbers (basic pattern)
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    // IP addresses
    /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
    // Names (basic pattern - would need ML for better detection)
    /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
  ];

  private replacementMap: Map<string, string> = new Map();
  private reverseMap: Map<string, string> = new Map();

  constructor(private config: PrivacyConfig) {}

  /**
   * Detect and anonymize PII in text
   */
  anonymizeText(text: string, level: "LIGHT" | "FULL" = "LIGHT"): string {
    let anonymized = text;

    if (level === "LIGHT") {
      // Light anonymization - replace with placeholders
      anonymized = this.lightAnonymization(text);
    } else {
      // Full anonymization - more aggressive
      anonymized = this.fullAnonymization(text);
    }

    return anonymized;
  }

  /**
   * Light anonymization - replace with placeholders
   */
  private lightAnonymization(text: string): string {
    let result = text;

    // Replace emails with [EMAIL]
    result = result.replace(this.piiPatterns[0], '[EMAIL]');
    
    // Replace phone numbers with [PHONE]
    result = result.replace(this.piiPatterns[1], '[PHONE]');
    
    // Replace SSNs with [SSN]
    result = result.replace(this.piiPatterns[2], '[SSN]');
    
    // Replace credit cards with [CARD]
    result = result.replace(this.piiPatterns[3], '[CARD]');
    
    // Replace IPs with [IP]
    result = result.replace(this.piiPatterns[4], '[IP]');

    return result;
  }

  /**
   * Full anonymization - replace with random IDs
   */
  private fullAnonymization(text: string): string {
    let result = text;

    // Create consistent replacements
    const createReplacement = (original: string, type: string): string => {
      if (!this.replacementMap.has(original)) {
        const replacement = `[${type}_${this.generateRandomId()}]`;
        this.replacementMap.set(original, replacement);
        this.reverseMap.set(replacement, original);
      }
      return this.replacementMap.get(original)!;
    };

    // Replace each pattern type
    result = result.replace(this.piiPatterns[0], (match) => 
      createReplacement(match, 'EMAIL')
    );
    
    result = result.replace(this.piiPatterns[1], (match) => 
      createReplacement(match, 'PHONE')
    );
    
    result = result.replace(this.piiPatterns[2], (match) => 
      createReplacement(match, 'SSN')
    );
    
    result = result.replace(this.piiPatterns[3], (match) => 
      createReplacement(match, 'CARD')
    );
    
    result = result.replace(this.piiPatterns[4], (match) => 
      createReplacement(match, 'IP')
    );

    // Names get special treatment
    result = result.replace(this.piiPatterns[5], (match) => 
      createReplacement(match, 'NAME')
    );

    return result;
  }

  /**
   * Generate random ID for replacements
   */
  private generateRandomId(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  /**
   * Check if text contains PII
   */
  containsPII(text: string): boolean {
    for (const pattern of this.piiPatterns) {
      if (pattern.test(text)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get PII detection report
   */
  getPIIReport(text: string): {
    containsPII: boolean;
    detectedTypes: string[];
    confidence: number;
  } {
    const detectedTypes: string[] = [];
    const patterns = [
      'EMAIL', 'PHONE', 'SSN', 'CARD', 'IP', 'NAME'
    ];

    for (let i = 0; i < this.piiPatterns.length; i++) {
      if (this.piiPatterns[i].test(text)) {
        detectedTypes.push(patterns[i]);
      }
    }

    return {
      containsPII: detectedTypes.length > 0,
      detectedTypes,
      confidence: Math.min(detectedTypes.length * 0.2, 1.0), // Simple confidence score
    };
  }

  /**
   * Reverse anonymization (for authorized users)
   */
  reverseAnonymization(text: string): string {
    let result = text;

    // Replace all anonymized placeholders with original values
    for (const [replacement, original] of this.reverseMap.entries()) {
      result = result.replace(new RegExp(replacement.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), original);
    }

    return result;
  }

  /**
   * Clear replacement maps
   */
  clearMaps(): void {
    this.replacementMap.clear();
    this.reverseMap.clear();
  }
}

/**
 * Data Retention Manager
 */
export class DataRetentionManager {
  constructor(
    private defaultRetentionDays: number = 90,
    private maxRetentionDays: number = 365 * 5 // 5 years max
  ) {}

  /**
   * Calculate retention date for data
   */
  calculateRetentionDate(createdAt: Date, customRetentionDays?: number): Date {
    const retentionDays = customRetentionDays || this.defaultRetentionDays;
    const retentionDate = new Date(createdAt);
    retentionDate.setDate(retentionDate.getDate() + retentionDays);
    return retentionDate;
  }

  /**
   * Check if data should be deleted
   */
  shouldDeleteData(createdAt: Date, retentionDate: Date): boolean {
    return new Date() >= retentionDate;
  }

  /**
   * Validate retention period
   */
  validateRetentionPeriod(days: number): boolean {
    return days > 0 && days <= this.maxRetentionDays;
  }

  /**
   * Generate retention policy report
   */
  generateRetentionReport(data: Array<{ createdAt: Date; retentionDays?: number }>): {
    totalItems: number;
    itemsToDelete: number;
    itemsExpiringSoon: number; // Within 30 days
    averageRetentionDays: number;
  } {
    const now = new Date();
    let itemsToDelete = 0;
    let itemsExpiringSoon = 0;
    let totalRetentionDays = 0;

    for (const item of data) {
      const retentionDate = this.calculateRetentionDate(item.createdAt, item.retentionDays);
      
      if (this.shouldDeleteData(item.createdAt, retentionDate)) {
        itemsToDelete++;
      } else if (retentionDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) {
        itemsExpiringSoon++;
      }

      totalRetentionDays += (item.retentionDays || this.defaultRetentionDays);
    }

    return {
      totalItems: data.length,
      itemsToDelete,
      itemsExpiringSoon,
      averageRetentionDays: totalRetentionDays / data.length,
    };
  }
}

/**
 * Compliance Manager
 */
export class ComplianceManager {
  constructor(
    private privacyManager: PrivacyManager,
    private retentionManager: DataRetentionManager
  ) {}

  /**
   * Process data for compliance
   */
  async processDataForCompliance(
    data: any,
    config: PrivacyConfig
  ): Promise<{
    processed: any;
    piiReport: any;
    retentionDate: Date;
  }> {
    // Check for PII
    const piiReport = this.privacyManager.getPIIReport(JSON.stringify(data));
    
    // Apply anonymization if needed
    let processed = data;
    if (config.containsPII && config.piiPolicy !== "RAW_RESEARCH") {
      const anonymizationLevel = config.anonymizationLevel || "LIGHT";
      processed = JSON.parse(
        this.privacyManager.anonymizeText(JSON.stringify(data), anonymizationLevel)
      );
    }

    // Calculate retention date
    const createdAt = new Date();
    const retentionDate = this.retentionManager.calculateRetentionDate(
      createdAt, 
      config.retentionDays
    );

    return {
      processed,
      piiReport,
      retentionDate,
    };
  }

  /**
   * Validate experiment configuration for compliance
   */
  validateExperimentConfig(config: any): {
    valid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check PII configuration
    if (config.containsPII && !config.piiPolicy) {
      errors.push("PII policy must be specified when containsPII is true");
    }

    if (config.piiPolicy === "RAW_RESEARCH" && config.orgId) {
      warnings.push("RAW_RESEARCH PII policy requires special authorization");
    }

    // Check retention period
    if (config.retentionDays) {
      if (!this.retentionManager.validateRetentionPeriod(config.retentionDays)) {
        errors.push(`Retention period ${config.retentionDays} days exceeds maximum allowed`);
      }
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors,
    };
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(data: Array<{
    id: string;
    createdAt: Date;
    containsPII: boolean;
    piiPolicy?: string;
    retentionDays?: number;
    orgId: string;
  }>): {
    totalExperiments: number;
    experimentsWithPII: number;
    experimentsByPolicy: Record<string, number>;
    retentionSummary: any;
  } {
    const experimentsWithPII = data.filter(e => e.containsPII).length;
    
    const experimentsByPolicy = data.reduce((acc, exp) => {
      const policy = exp.piiPolicy || "NONE";
      acc[policy] = (acc[policy] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const retentionSummary = this.retentionManager.generateRetentionReport(
      data.map(e => ({ createdAt: e.createdAt, retentionDays: e.retentionDays }))
    );

    return {
      totalExperiments: data.length,
      experimentsWithPII,
      experimentsByPolicy,
      retentionSummary,
    };
  }
}