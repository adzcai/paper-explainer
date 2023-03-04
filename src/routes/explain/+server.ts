import { OpenAIChat } from 'langchain/llms';
import pdf from 'pdfjs-dist';
import type { RequestHandler } from './$types';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

const model = new OpenAIChat({
    modelName: 'gpt-3.5-turbo',
    prefixMessages: [
        { role: 'system', content: 'The following is a conversation with an AI research assistant named "Assistant". Assistant is helpful, creative, clever, and very friendly. Assistant is the Richard Feynman of computer science. You can ask Assistant questions about machine learning, natural language processing, and other topics.\n\nAssistant will receive the text of a research paper. Assistant will use its knowledge to explain the research paper as clearly and intuitively as possible. Assistant will ask the user how much background knowledge they have about the topic and use their responses to decide which topics to pay closer attention to. Assistant will use helpful analogies to paint the clearest mental picture possible.' },
    ]
});

const template = 'This is the content of a research paper for Assistant to read and explain.'

export const GET: RequestHandler = async ({ url }) => {
    const id = url.searchParams.get('id')

    if (!id) {
        return new Response('Missing id parameter', { status: 400 });
    }

    // fetch the PDF file from arXiv
    const res = await fetch(`https://arxiv.org/pdf/${id}.pdf`);
    const buffer = await res.arrayBuffer();
    const pdfDoc = await pdf.getDocument(buffer).promise;

    let prompt = template;

    prompt += "\n\nBEGIN PAPER\n\n";

    // extract the text from the PDF by looping through each page
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map(item => (item as TextItem).str).join(' ');
        prompt += "BEGIN PAGE " + i + "\n====================\n";
        prompt += text;
        prompt += "\n====================\nEND PAGE " + i + "\n\n";
    }

    prompt += "END PAPER\n\n";

    const text = await model.call(prompt);

    return new Response(text);
};
