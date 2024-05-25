import fileUpload from 'express-fileupload';
import xlsx from 'xlsx';

export function convertExcelToJson<T>(fileFromClient: fileUpload.UploadedFile[] | fileUpload.UploadedFile) {
  if (
    !Array.isArray(fileFromClient) &&
    ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(fileFromClient.mimetype)
  ) {
    // Excel file
    const workbook = xlsx.read(fileFromClient.data, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);
    return data as T[];
  }
  throw new Error('Unsupported file type');
}
