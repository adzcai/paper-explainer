import { OpenAIChat } from 'langchain/llms';
import { loadSummarizationChain } from 'langchain/chains'
import { Document } from 'langchain/document';
import pdf from 'pdfjs-dist';
import { OPENAI_API_KEY } from '$env/static/private'

import type { RequestHandler } from './$types';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

const model = new OpenAIChat({
    modelName: 'gpt-3.5-turbo',
    prefixMessages: [
        { role: 'system', content: 'The following is a conversation with an AI research assistant named "Assistant". Assistant is helpful, creative, clever, and very friendly. Assistant is the Richard Feynman of computer science. You can ask Assistant questions about machine learning, natural language processing, and other topics.\n\nAssistant will receive the text of a research paper. Assistant will use its knowledge to explain the research paper as clearly and intuitively as possible. Assistant will ask the user how much background knowledge they have about the topic and use their responses to decide which topics to pay closer attention to. Assistant will use helpful analogies to paint the clearest mental picture possible.' },
    ],
    temperature: 0.3,
    openAIApiKey: OPENAI_API_KEY,
});

const summarizationChain = loadSummarizationChain(model);

export const GET: RequestHandler = async ({ url }) => {
    const id = url.searchParams.get('id')

    if (!id) {
        return new Response('Missing id parameter', { status: 400 });
    }

    // fetch the PDF file from arXiv
    const res = await fetch(`https://arxiv.org/pdf/${id}.pdf`);
    const buffer = await res.arrayBuffer();
    const pdfDoc = await pdf.getDocument(buffer).promise;

    // extract the text from the PDF by looping through each page
    let pages = []
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageContent = textContent.items.map(item => (item as TextItem).str).join(' ');
        pages.push(new Document({ pageContent }));
    }

    try {
        const summary = await summarizationChain.call({
            input_documents: pages
        });

        return new Response(summary.text as string);
    } catch (e) {
        console.log('Error calling OpenAI', e);
        return new Response('Error calling OpenAI', { status: 500 });
    }
};
