import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx';
import { Upload, Button, message, Tooltip } from 'antd';
import { InfoCircleOutlined, UploadOutlined } from '@ant-design/icons';

function UploadRecipientAndAmount({
  onFileProcessed
}: {
  onFileProcessed: (data: any) => void;
}) {

  const [file, setFile] = useState<File | null>(null);

  const processFile = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };


  // const handleSubmit = async (e: any) => {
  //   e.preventDefault();
  //   const file = e.target.files[0];
  //   if (!file) {
  //     return;
  //   }
  //   setFile(file);
  // };

  const handleSubmit = (info: any) => {
    console.log('info', info);
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      setFile(info.file.originFileObj);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
    if (info.file.status === 'removed') {
      setFile(null);
    }
  }

  useEffect(() => {
    const uploadFile = async () => {
      if (!file) {
        console.log('no file');
        onFileProcessed([{
          address: '',
          amount: 0
        }]);
        return;
      }
      const data = await processFile(file) as Array<any>;
      const parsedData = data.map((item: any) => ({
        address: item.address || item.Address,
        amount: item.amount || item.Amount
      }));
      onFileProcessed(parsedData);
    }
    uploadFile();
  }, [file]);


  return (
    <div className='flex items-center justify-end gap-x-2 w-full'>
      {/* <input type="file" accept=".xlsx, .xls" onChange={handleSubmit} /> */}
      <Upload accept=".xlsx, .xls" onChange={handleSubmit} maxCount={1}>
        <div className='flex items-center justify-end gap-x-2 w-full'>
          <Button className='bg-primary text-white' icon={<UploadOutlined />}>Upload</Button>
          <Tooltip
          title={
            'Upload an excel file with the following\ncolumns: Address, Amount'
          }
            getPopupContainer={(triggerNode) => triggerNode}
            className='text-primary'
          >
            <InfoCircleOutlined />  
          </Tooltip>
        </div>
      </Upload>
    </div>
  )
}

export default UploadRecipientAndAmount;
