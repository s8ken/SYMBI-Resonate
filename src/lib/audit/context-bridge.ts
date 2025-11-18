/**
 * Context Bridge: Audit-Ready Transparency Layer
 * Provides one-click bundles of receipts + proofs for auditors
 */

import { SYMBIReceipt, SYMBIReceiptGenerator } from './receipt-system';
import { config } from '../../config/env';

export interface ContextBridgeTicket {
  ticket_version: string;
  summary: string;
  receipts: {
    sybi: SYMBIReceipt;
    shard_manifests: string[];
    merkle_root: string;
    merkle_proofs: { leaf: string; siblings: string[]; flags: ('L'|'R')[] }[];
  };
  scope: {
    allow_raw: boolean;
    allow_training: boolean;
    max_retention_days: number;
    purpose: string;
  };
  transparency_log: {
    who: string;
    what: string;
    when: string;
    cbt_id: string;
  }[];
  signatures: {
    gateway: string;
    audit: string;
  };
}

export class ContextBridge {
  private receiptGenerator = new SYMBIReceiptGenerator();

  async createTicket(
    summary: string,
    validationData: any,
    scope: ContextBridgeTicket['scope']
  ): Promise<ContextBridgeTicket> {
    const receipt = await this.receiptGenerator.generateReceipt(
      config.TENANT_ID,
      Date.now().toString(),
      `output_${Date.now()}`,
      config.MODEL_ID,
      config.POLICY_PACK,
      validationData
    );

    return {
      ticket_version: '1.0',
      summary,
      receipts: {
        sybi: receipt,
        shard_manifests: await this.generateShardManifests(validationData),
        merkle_root: await this.computeMerkleRoot(validationData),
        merkle_proofs: await this.generateMerkleProofs(validationData)
      },
      scope,
      transparency_log: await this.generateTransparencyLog(),
      signatures: await this.generateSignatures()
    };
  }

  async auditBundle(ticket: ContextBridgeTicket): Promise<{
    valid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Validate SYMBI receipt
    const receiptValidation = await this.validateSYMBIReceipt(ticket.receipts.sybi);
    if (!receiptValidation.valid) {
      issues.push(...receiptValidation.issues);
    }

    // Validate signatures
    const signatureValidation = await this.validateSignatures(ticket.signatures);
    if (!signatureValidation.valid) {
      issues.push(...signatureValidation.issues);
    }

    // Validate scope compliance
    const scopeValidation = await this.validateScope(ticket.scope);
    if (!scopeValidation.valid) {
      issues.push(...scopeValidation.issues);
    }

    return {
      valid: issues.length === 0,
      issues,
      recommendations
    };
  }

  private async generateShardManifests(data: any): Promise<string[]> {
    const shards = this.extractDataShards(data);
    const manifests = await Promise.all(shards.map(async shard => {
      const h = await this.hashSHA256(JSON.stringify(shard));
      return `manifest:${h}`;
    }));
    return manifests;
  }

  private async generateMerkleProofs(data: any): Promise<{ leaf: string; siblings: string[]; flags: ('L'|'R')[] }[]> {
    const leaves = this.extractDataShards(data);
    const leafHashes = await Promise.all(leaves.map(l => this.hashSHA256(JSON.stringify(l))));
    const { proofs } = await this.buildMerkle(leafHashes);
    return proofs;
  }

  private async computeMerkleRoot(data: any): Promise<string> {
    const leaves = this.extractDataShards(data);
    const leafHashes = await Promise.all(leaves.map(l => this.hashSHA256(JSON.stringify(l))));
    const { root } = await this.buildMerkle(leafHashes);
    return root;
  }

  private async generateTransparencyLog(): Promise<ContextBridgeTicket['transparency_log']> {
    return [{
      who: 'agent-system',
      what: 'generated-sybi-receipt',
      when: new Date().toISOString(),
      cbt_id: `cbt_${Date.now()}`
    }];
  }

  private async generateSignatures(): Promise<ContextBridgeTicket['signatures']> {
    return {
      gateway: await this.signWithGateway(),
      audit: await this.signWithAudit()
    };
  }

  private extractDataShards(data: any): any[] {
    // Implementation would extract meaningful data shards
    return [data];
  }

  private async buildMerkle(leafHashes: string[]): Promise<{ root: string; proofs: { leaf: string; siblings: string[]; flags: ('L'|'R')[] }[] }> {
    if (leafHashes.length === 0) return { root: '', proofs: [] };
    let level = leafHashes.slice();
    let indexMap: number[] = leafHashes.map((_, idx) => idx);
    const paths: { [idx: number]: { siblings: string[]; flags: ('L'|'R')[] } } = {};
    while (level.length > 1) {
      const next: string[] = [];
      const nextIndexMap: number[] = [];
      for (let i = 0; i < level.length; i += 2) {
        const left = level[i];
        const right = level[i + 1] ?? left;
        const h = await this.hashSHA256(left + right);
        next.push(h);
        const leftIdx = indexMap[i];
        const rightIdx = indexMap[i + 1] ?? indexMap[i];
        if (!paths[leftIdx]) paths[leftIdx] = { siblings: [], flags: [] };
        paths[leftIdx].siblings.push(right);
        paths[leftIdx].flags.push('L');
        if (rightIdx !== leftIdx) {
          if (!paths[rightIdx]) paths[rightIdx] = { siblings: [], flags: [] };
          paths[rightIdx].siblings.push(left);
          paths[rightIdx].flags.push('R');
        }
        nextIndexMap.push(leftIdx);
      }
      level = next;
      indexMap = nextIndexMap;
    }
    const root = level[0];
    const proofs = leafHashes.map((leaf, idx) => ({ leaf, siblings: paths[idx]?.siblings || [], flags: paths[idx]?.flags || [] }));
    return { root, proofs };
  }

  private buildMerkleTree(data: any): { proofs: string[] } {
    // Simplified Merkle tree implementation
    const hash = this.hashSHA256(JSON.stringify(data));
    return { proofs: [`merkle:${hash}`] };
  }

  private async validateSYMBIReceipt(receipt: SYMBIReceipt): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    if (receipt.receipt_version !== '1.0') {
      issues.push('Invalid receipt version');
    }

    if (receipt.confidence < 0 || receipt.confidence > 1) {
      issues.push('Confidence out of range');
    }

    return { valid: issues.length === 0, issues };
  }

  private async validateSignatures(signatures: ContextBridgeTicket['signatures']): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    // Simplified signature validation
    return { valid: true, issues: [] };
  }

  private async validateScope(scope: ContextBridgeTicket['scope']): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    if (scope.max_retention_days < 0) {
      issues.push('Invalid retention period');
    }

    return { valid: issues.length === 0, issues };
  }

  private async signWithGateway(): Promise<string> {
    const { ed25519Sign } = await import('./crypto-utils');
    const payload = new TextEncoder().encode('gateway:' + Date.now().toString());
    const sig = await ed25519Sign(payload);
    return sig.alg === 'none' ? 'UNSIGNED' : `Ed25519:${sig.kid}:${sig.sig_base64}`;
  }

  private async signWithAudit(): Promise<string> {
    const { ed25519Sign } = await import('./crypto-utils');
    const payload = new TextEncoder().encode('audit:' + Date.now().toString());
    const sig = await ed25519Sign(payload);
    return sig.alg === 'none' ? 'UNSIGNED' : `Ed25519:${sig.kid}:${sig.sig_base64}`;
  }

  private async hashSHA256(input: string): Promise<string> {
    const enc = new TextEncoder();
    // Prefer WebCrypto
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', enc.encode(input));
      const bytes = Array.from(new Uint8Array(buf));
      return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Node fallback
    const nodeCrypto = await import('node:crypto');
    return nodeCrypto.createHash('sha256').update(input).digest('hex');
  }
}
