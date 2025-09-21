#!/usr/bin/env python3
"""
Test script to run SYMBI framework detection on sample responses
This will help us identify the gaps between manual analysis and automated detection
"""

import re
from typing import Dict, List, Tuple

class SymbiFrameworkTester:
    def __init__(self):
        pass
    
    def calculate_reality_index(self, content: str) -> Dict[str, float]:
        """Calculate Reality Index components"""
        content_lower = content.lower()
        
        # Mission alignment - check for goal-oriented language
        goal_terms = ['goal', 'mission', 'purpose', 'objective', 'aim', 'target', 'explain', 'understand']
        alignment_terms = ['align', 'consistent', 'coherent', 'harmony', 'synergy']
        
        mission_score = 5.0
        for term in goal_terms:
            if term in content_lower:
                mission_score += 0.5
        for term in alignment_terms:
            if term in content_lower:
                mission_score += 0.5
        mission_score = min(10.0, mission_score)
        
        # Contextual coherence - analyze sentence structure
        sentences = re.split(r'[.!?]+', content)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        coherence_score = 5.0
        if len(sentences) >= 3:
            # Simple coherence check - look for connecting words
            connecting_words = ['however', 'therefore', 'thus', 'furthermore', 'moreover', 'additionally', 'also', 'since', 'because']
            for word in connecting_words:
                if word in content_lower:
                    coherence_score += 0.3
        coherence_score = min(10.0, coherence_score)
        
        # Technical accuracy - check for technical terms
        technical_terms = ['algorithm', 'framework', 'system', 'process', 'method', 'analysis', 'data', 'research', 'implementation', 'development', 'neural', 'attention', 'transformer', 'embedding']
        
        technical_score = 5.0
        for term in technical_terms:
            if term in content_lower:
                technical_score += 0.3
        
        # Check for numerical data
        if re.search(r'\d+(\.\d+)?%?', content):
            technical_score += 1.0
        
        # Check for citations or references
        if re.search(r'\[\d+\]|\(\d{4}\)|et al\.|paper|study', content):
            technical_score += 1.5
            
        technical_score = min(10.0, technical_score)
        
        # Authenticity - check for non-generic content
        generic_phrases = ['at the end of the day', 'think outside the box', 'best practices', 'going forward', 'touch base', 'circle back']
        
        authenticity_score = 7.0
        for phrase in generic_phrases:
            if phrase in content_lower:
                authenticity_score -= 0.5
        
        # Check for specific details
        if re.search(r'\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}', content):
            authenticity_score += 1.0
        
        # Check for first-person perspective
        if re.search(r'\b(i|we|our|my)\b', content_lower):
            authenticity_score += 0.5
            
        authenticity_score = min(10.0, max(0.0, authenticity_score))
        
        overall_score = (mission_score + coherence_score + technical_score + authenticity_score) / 4
        
        return {
            'overall': round(overall_score, 1),
            'mission_alignment': round(mission_score, 1),
            'contextual_coherence': round(coherence_score, 1),
            'technical_accuracy': round(technical_score, 1),
            'authenticity': round(authenticity_score, 1)
        }
    
    def calculate_trust_protocol(self, content: str) -> Dict[str, str]:
        """Calculate Trust Protocol components"""
        content_lower = content.lower()
        
        # Verification methods
        verification_terms = ['verify', 'validate', 'confirm', 'check', 'evidence', 'proof', 'source', 'reference']
        negative_terms = ['unverified', 'unvalidated', 'unchecked']
        
        verification_status = self._evaluate_trust_component(content_lower, verification_terms, negative_terms)
        
        # Boundary maintenance
        boundary_terms = ['boundary', 'limit', 'scope', 'constraint', 'parameter', 'limitation', 'cannot', 'unable']
        boundary_negative = ['unlimited', 'unbounded', 'unconstrained']
        
        boundary_status = self._evaluate_trust_component(content_lower, boundary_terms, boundary_negative)
        
        # Security awareness
        security_terms = ['secure', 'protect', 'privacy', 'confidential', 'safety', 'limitation', 'note', 'should']
        security_negative = ['insecure', 'unprotected', 'vulnerable']
        
        security_status = self._evaluate_trust_component(content_lower, security_terms, security_negative)
        
        # Overall status
        statuses = [verification_status, boundary_status, security_status]
        if 'FAIL' in statuses:
            overall_status = 'FAIL'
        elif 'PARTIAL' in statuses:
            overall_status = 'PARTIAL'
        else:
            overall_status = 'PASS'
        
        return {
            'overall': overall_status,
            'verification_methods': verification_status,
            'boundary_maintenance': boundary_status,
            'security_awareness': security_status
        }
    
    def _evaluate_trust_component(self, content: str, positive_terms: List[str], negative_terms: List[str]) -> str:
        """Evaluate a component of the Trust Protocol"""
        positive_count = sum(1 for term in positive_terms if term in content)
        negative_count = sum(1 for term in negative_terms if term in content)
        
        if negative_count > 0:
            return 'FAIL'
        elif positive_count >= 2:
            return 'PASS'
        else:
            return 'PARTIAL'
    
    def calculate_canvas_parity(self, content: str) -> Dict[str, int]:
        """Calculate Canvas Parity components"""
        content_lower = content.lower()
        
        # Human agency
        human_terms = ['you', 'your', 'user', 'human', 'people', 'person', 'reader', 'understand', 'help']
        agency_score = 50
        for term in human_terms:
            if term in content_lower:
                agency_score += 3
        
        # Check for questions to reader
        if '?' in content:
            agency_score += 10
        
        agency_score = min(100, agency_score)
        
        # AI contribution
        ai_terms = ['ai', 'model', 'algorithm', 'system', 'process', 'analysis', 'explain', 'understand']
        ai_score = 50
        for term in ai_terms:
            if term in content_lower:
                ai_score += 3
        
        ai_score = min(100, ai_score)
        
        # Transparency
        transparency_terms = ['note', 'should', 'limitation', 'simplified', 'explain', 'clarify', 'understand']
        transparency_score = 50
        for term in transparency_terms:
            if term in content_lower:
                transparency_score += 3
        
        # Check for explicit acknowledgments
        if any(phrase in content_lower for phrase in ['i should note', 'limitations', 'simplified', 'acknowledge']):
            transparency_score += 10
            
        transparency_score = min(100, transparency_score)
        
        # Collaboration quality
        collab_terms = ['help', 'understand', 'explain', 'clarify', 'question', 'ask', 'discuss']
        collab_score = 50
        for term in collab_terms:
            if term in content_lower:
                collab_score += 3
        
        # Check for interactive elements
        if '?' in content:
            collab_score += 10
        
        collab_score = min(100, collab_score)
        
        overall_score = round((agency_score + ai_score + transparency_score + collab_score) / 4)
        
        return {
            'overall': overall_score,
            'human_agency': agency_score,
            'ai_contribution': ai_score,
            'transparency': transparency_score,
            'collaboration_quality': collab_score
        }
    
    def test_response(self, content: str, model_name: str) -> Dict:
        """Test a response and return all scores"""
        print(f"\n=== Testing {model_name} Response ===")
        
        reality_index = self.calculate_reality_index(content)
        trust_protocol = self.calculate_trust_protocol(content)
        canvas_parity = self.calculate_canvas_parity(content)
        
        # Calculate overall score (simplified)
        reality_score = reality_index['overall'] * 10  # Convert to 0-100 scale
        trust_score = 100 if trust_protocol['overall'] == 'PASS' else 50 if trust_protocol['overall'] == 'PARTIAL' else 0
        canvas_score = canvas_parity['overall']
        
        overall_score = round((reality_score * 0.4 + trust_score * 0.3 + canvas_score * 0.3))
        
        results = {
            'model': model_name,
            'overall_score': overall_score,
            'reality_index': reality_index,
            'trust_protocol': trust_protocol,
            'canvas_parity': canvas_parity
        }
        
        # Print results
        print(f"Overall Score: {overall_score}/100")
        print(f"Reality Index: {reality_index['overall']}/10.0")
        print(f"  - Mission Alignment: {reality_index['mission_alignment']}")
        print(f"  - Contextual Coherence: {reality_index['contextual_coherence']}")
        print(f"  - Technical Accuracy: {reality_index['technical_accuracy']}")
        print(f"  - Authenticity: {reality_index['authenticity']}")
        print(f"Trust Protocol: {trust_protocol['overall']}")
        print(f"  - Verification: {trust_protocol['verification_methods']}")
        print(f"  - Boundary: {trust_protocol['boundary_maintenance']}")
        print(f"  - Security: {trust_protocol['security_awareness']}")
        print(f"Canvas Parity: {canvas_parity['overall']}/100")
        print(f"  - Human Agency: {canvas_parity['human_agency']}")
        print(f"  - AI Contribution: {canvas_parity['ai_contribution']}")
        print(f"  - Transparency: {canvas_parity['transparency']}")
        print(f"  - Collaboration: {canvas_parity['collaboration_quality']}")
        
        return results

def main():
    # Sample responses
    deepseek_response = """Transformer neural networks are a type of deep learning architecture that has revolutionized natural language processing and many other AI domains. Let me explain how they work in simple terms.

At their core, transformers are designed to process sequential data (like text) by using a mechanism called "attention" rather than processing the data in order like older models did. This allows them to consider the entire context at once.

The key components of transformer models include:

1. **Embeddings**: First, words or tokens are converted into numerical vectors (embeddings) that the model can work with.

2. **Positional Encoding**: Since transformers process all tokens simultaneously rather than sequentially, positional encodings are added to the embeddings to give the model information about the order of the tokens.

3. **Self-Attention Mechanism**: This is the most important innovation in transformers. The self-attention mechanism allows the model to weigh the importance of different words in relation to each other, regardless of their position in the sequence.

Since their introduction in the 2017 paper "Attention Is All You Need" by Vaswani et al., transformers have become the foundation for most state-of-the-art language models, including BERT, GPT, T5, and many others."""

    claude_response = """Transformer neural networks are a type of machine learning architecture that has revolutionized how AI processes sequential data, especially text. Let me explain how they work in simple terms.

## The Core Idea: Attention

The fundamental innovation of transformers is something called "attention." Unlike earlier neural networks that processed text word by word in order (like how we read), transformers can look at an entire sentence or paragraph at once and understand how each word relates to all the others.

Imagine you're at a party with many conversations happening. Your brain can "pay attention" to specific voices or conversations even with background noise. Transformers do something similar with text - they can focus on relevant connections between words, even if they're far apart.

I should note that there are limitations to my explanation. The actual mathematics involves concepts like query, key, and value vectors, matrix multiplications, and normalization techniques that I've simplified here.

Transformers have become the foundation for most modern language AI systems, including models like BERT, GPT, T5, and myself (Claude). They've enabled remarkable improvements in translation, summarization, question answering, and text generation.

Does this explanation help you understand the basic concept, or would you like me to elaborate on any particular aspect?"""
    
    tester = SymbiFrameworkTester()
    
    print("SYMBI Framework Detection Tool - Actual vs Expected Results")
    print("=" * 60)
    
    # Test both responses
    deepseek_results = tester.test_response(deepseek_response, "DeepSeek")
    claude_results = tester.test_response(claude_response, "Claude")
    
    print("\n" + "=" * 60)
    print("COMPARISON SUMMARY")
    print("=" * 60)
    print(f"DeepSeek Overall Score: {deepseek_results['overall_score']}/100")
    print(f"Claude Overall Score: {claude_results['overall_score']}/100")
    print(f"Difference: {claude_results['overall_score'] - deepseek_results['overall_score']} points")
    
    # Compare with expected results
    print("\n" + "=" * 60)
    print("EXPECTED vs ACTUAL COMPARISON")
    print("=" * 60)
    print("Expected (from manual analysis):")
    print("  DeepSeek: 74/100, Claude: 79/100 (Claude +5)")
    print("Actual (from automated tool):")
    print(f"  DeepSeek: {deepseek_results['overall_score']}/100, Claude: {claude_results['overall_score']}/100 (Claude {claude_results['overall_score'] - deepseek_results['overall_score']:+d})")

if __name__ == "__main__":
    main()