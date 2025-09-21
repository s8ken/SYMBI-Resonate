// Test script to run SYMBI framework detection on sample responses
// This will help us identify the gaps between manual analysis and automated detection

import { SymbiFrameworkDetector } from './src/lib/symbi-framework/detector.js';

// Sample responses for testing
const deepseekResponse = `Transformer neural networks are a type of deep learning architecture that has revolutionized natural language processing and many other AI domains. Let me explain how they work in simple terms.

At their core, transformers are designed to process sequential data (like text) by using a mechanism called "attention" rather than processing the data in order like older models did. This allows them to consider the entire context at once.

The key components of transformer models include:

1. **Embeddings**: First, words or tokens are converted into numerical vectors (embeddings) that the model can work with.

2. **Positional Encoding**: Since transformers process all tokens simultaneously rather than sequentially, positional encodings are added to the embeddings to give the model information about the order of the tokens.

3. **Self-Attention Mechanism**: This is the most important innovation in transformers. The self-attention mechanism allows the model to weigh the importance of different words in relation to each other, regardless of their position in the sequence. For example, in the sentence "The animal didn't cross the street because it was too wide," the word "it" refers to "street" not "animal." Self-attention helps the model make these connections.

4. **Multi-Head Attention**: Transformers typically use multiple "attention heads" that can focus on different aspects of the relationships between words, allowing the model to capture various types of dependencies.

5. **Feed-Forward Networks**: After the attention mechanism, the data passes through feed-forward neural networks that process the information further.

6. **Layer Normalization and Residual Connections**: These components help stabilize and speed up the training process.

7. **Encoder-Decoder Structure**: Many transformer models have an encoder that processes the input and a decoder that generates the output, though some models (like BERT) use only the encoder, while others (like GPT) use only the decoder.

The power of transformers comes from their ability to process all parts of a sequence in parallel (unlike RNNs or LSTMs that process sequentially) while still understanding the relationships between distant elements in the sequence. This parallel processing makes them more efficient to train on modern hardware like GPUs.

Since their introduction in the 2017 paper "Attention Is All You Need" by Vaswani et al., transformers have become the foundation for most state-of-the-art language models, including BERT, GPT, T5, and many others. They've enabled significant advances in machine translation, text generation, question answering, and numerous other NLP tasks.

The technical implementation involves matrix operations and complex mathematical calculations, but conceptually, you can think of transformers as models that can "pay attention" to different parts of the input data simultaneously, weighing their relevance to each other to understand the overall meaning and context.`;

const claudeResponse = `Transformer neural networks are a type of machine learning architecture that has revolutionized how AI processes sequential data, especially text. Let me explain how they work in simple terms.

## The Core Idea: Attention

The fundamental innovation of transformers is something called "attention." Unlike earlier neural networks that processed text word by word in order (like how we read), transformers can look at an entire sentence or paragraph at once and understand how each word relates to all the others.

Imagine you're at a party with many conversations happening. Your brain can "pay attention" to specific voices or conversations even with background noise. Transformers do something similar with text - they can focus on relevant connections between words, even if they're far apart.

## How Transformers Process Information

When a transformer processes a sentence like "The cat sat on the mat because it was comfortable":

1. **Word Representation**: First, each word is converted into a numerical representation (a vector of numbers).

2. **Position Information**: Since transformers process all words simultaneously, they need to know word order. They add "positional encoding" to each word vector to indicate its position in the sentence.

3. **Self-Attention**: This is where the magic happens. The transformer examines relationships between every pair of words. It might recognize that "it" in our example refers to "mat" rather than "cat" by assigning higher attention scores to relevant connections.

4. **Multiple Perspectives**: Transformers use "multi-head attention," which is like having multiple people analyze the same sentence, each focusing on different types of relationships (grammar, subject-object relationships, etc.).

5. **Processing Layers**: The information flows through several layers, each refining the understanding of the text.

## Why Transformers Are Important

Transformers offer several advantages over previous approaches:

- **Parallelization**: They process all words simultaneously rather than sequentially, making them much faster to train on modern hardware.

- **Long-range Connections**: They can easily connect related words regardless of distance between them.

- **Contextual Understanding**: They develop rich, context-dependent representations of words.

I should note that there are limitations to my explanation. The actual mathematics involves concepts like query, key, and value vectors, matrix multiplications, and normalization techniques that I've simplified here.

Transformers have become the foundation for most modern language AI systems, including models like BERT, GPT, T5, and myself (Claude). They've enabled remarkable improvements in translation, summarization, question answering, and text generation.

Does this explanation help you understand the basic concept, or would you like me to elaborate on any particular aspect?`;

async function testDetection() {
    console.log('Testing SYMBI Framework Detection Tool');
    console.log('=====================================\n');
    
    const detector = new SymbiFrameworkDetector();
    
    // Test DeepSeek response
    console.log('Testing DeepSeek Response:');
    const deepseekInput = {
        content: deepseekResponse,
        metadata: {
            source: 'DeepSeek AI',
            author: 'DeepSeek',
            context: 'Technical explanation prompt'
        }
    };
    
    try {
        const deepseekResult = await detector.analyzeContent(deepseekInput);
        console.log('DeepSeek Results:');
        console.log(`Overall Score: ${deepseekResult.assessment.overallScore}`);
        console.log(`Reality Index: ${deepseekResult.assessment.realityIndex.score}`);
        console.log(`Trust Protocol: ${deepseekResult.assessment.trustProtocol.status}`);
        console.log(`Ethical Alignment: ${deepseekResult.assessment.ethicalAlignment.score}`);
        console.log(`Resonance Quality: ${deepseekResult.assessment.resonanceQuality.level}`);
        console.log(`Canvas Parity: ${deepseekResult.assessment.canvasParity.score}`);
        console.log('\n');
    } catch (error) {
        console.error('Error testing DeepSeek response:', error);
    }
    
    // Test Claude response
    console.log('Testing Claude Response:');
    const claudeInput = {
        content: claudeResponse,
        metadata: {
            source: 'Claude AI',
            author: 'Claude',
            context: 'Technical explanation prompt'
        }
    };
    
    try {
        const claudeResult = await detector.analyzeContent(claudeInput);
        console.log('Claude Results:');
        console.log(`Overall Score: ${claudeResult.assessment.overallScore}`);
        console.log(`Reality Index: ${claudeResult.assessment.realityIndex.score}`);
        console.log(`Trust Protocol: ${claudeResult.assessment.trustProtocol.status}`);
        console.log(`Ethical Alignment: ${claudeResult.assessment.ethicalAlignment.score}`);
        console.log(`Resonance Quality: ${claudeResult.assessment.resonanceQuality.level}`);
        console.log(`Canvas Parity: ${claudeResult.assessment.canvasParity.score}`);
        console.log('\n');
    } catch (error) {
        console.error('Error testing Claude response:', error);
    }
}

// Run the test
testDetection().then(() => {
    console.log('Detection testing complete');
}).catch(error => {
    console.error('Test failed:', error);
});