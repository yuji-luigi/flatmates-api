import { OcrSpaceOptions, ocrSpace } from 'ocr-space-api-wrapper';
import vars, { rootDir } from '../../config/vars';

import path from 'path';
const { ocrSpaceSecret } = vars;
export async function testOcrSpace() {
  try {
    // Using the OCR.space default free API key (max 10reqs in 10mins) + remote file
    // const res1 = await ocrSpace('http://dl.a9t9.com/ocrbenchmark/eng.png');

    // Using your personal API key + local file
    const res2 = await ocrSpace(path.join(rootDir, 'src', 'assets', 'dev', 'invoice.pdf'), { apiKey: ocrSpaceSecret, OCREngine: '2' });
    console.log(res2);
    // Using your personal API key + base64 image + custom language
    // const res3 = await ocrSpace('data:image/png;base64...', { apiKey: ocrSpaceSecret, language: 'ita' });
    // console.log(res1, res2, res3);
  } catch (error) {
    console.error(error);
  }
}

export async function getOCRSpaceText(imagePath: string, options: OcrSpaceOptions = {}) {
  try {
    const res = await ocrSpace(imagePath, { apiKey: ocrSpaceSecret, OCREngine: '2', ...options });
    return res.ParsedResults[0].ParsedText;
  } catch (error) {
    console.error(error);
    return '';
  }
}
