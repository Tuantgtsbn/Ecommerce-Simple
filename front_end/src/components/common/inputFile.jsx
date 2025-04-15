import { UploadCloudIcon, X } from 'lucide-react';
import { Label } from '../ui/label';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
function InputFile({ files, setFormData, name, label, config, ...props }) {
    console.log('File insulation', files);
    const maxFiles = config.max || 1;
    const isMultiple = config.isMultiple;
    const fileInputRef = useRef(null);
    const [previews, setPreviews] = useState([]);
    const generatePreviews = (fileList) => {
        console.log(fileList);
        const urls = [];
        for (let file of fileList) {
            const url = URL.createObjectURL(file);
            urls.push(url);
        }
        // Cleanup old previews
        previews.forEach((url) => URL.revokeObjectURL(url));
        setPreviews(urls);
    };
    const handleChange = (event) => {
        let value;
        if (isMultiple) {
            value = Array.from({
                length: Math.min(event.target.files.length, maxFiles - files.length)
            }).map((_, index) => {
                return event.target.files[index];
            });
            generatePreviews([...files, ...value]);
        } else {
            value = event.target.files[0];
            generatePreviews([value]);
        }
        setFormData((prev) => {
            return {
                ...prev,
                [name]: isMultiple ? [...prev[name], ...value] : value
            };
        });
    };
    const handleOnDragOver = (event) => {
        event.preventDefault();
    };
    const handleOnDrop = (event) => {
        event.preventDefault();
        let value;
        if (isMultiple) {
            value = Array.from({
                length: Math.min(event.dataTransfer.files.length, maxFiles - files.length)
            }).map((_, index) => {
                return event.dataTransfer.files[index];
            });
            generatePreviews(value);
        } else {
            value = event.dataTransfer.files[0];
            generatePreviews([value]);
        }
        setFormData((prev) => {
            return {
                ...prev,
                [name]: isMultiple ? [...prev[name], ...value] : value
            };
        });
    };
    const handleRemoveFile = (index) => {
        if (isMultiple) {
            const newFiles = files.filter((file, i) => i !== index);
            const newPreviews = previews.filter((url, i) => i !== index);
            URL.revokeObjectURL(previews[index]);
            setPreviews(newPreviews);
            setFormData((prev) => {
                return {
                    ...prev,
                    [name]: newFiles
                };
            });
        } else {
            URL.revokeObjectURL(previews[0]);
            setPreviews([]);
            setFormData((prev) => {
                return {
                    ...prev,
                    [name]: null
                };
            });
            fileInputRef.current.value = '';
        }
    };
    useEffect(() => {
        return () => {
            previews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, []);
    return (
        <>
            <Label htmlFor={name}>{label}</Label>
            <div
                onDragOver={handleOnDragOver}
                onDrop={handleOnDrop}
                className='border-2 border-dashed rounded-lg p-4 hover:border-primary transition-colors'
            >
                <input
                    className='hidden'
                    type='file'
                    name={name}
                    id={name}
                    multiple={isMultiple}
                    onChange={handleChange}
                    {...props}
                    accept={config?.accept}
                    ref={fileInputRef}
                />
                {files &&
                typeof files === 'object' &&
                (Array.isArray(files) ? files.length > 0 : files.name) ? ( // Kiểm tra nếu files là mảng hoặc là đối tượng File
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                        {Array.isArray(files) ? (
                            <>
                                {files.map((file, index) => (
                                    <div key={index} className='flex flex-col  gap-2 relative'>
                                        <img
                                            src={previews[index]}
                                            alt={`Preview ${index + 1}`}
                                            className='w-full aspect-square object-contain rounded-md'
                                        />
                                        <span>{file.name}</span>
                                        <button
                                            onClick={() => handleRemoveFile(index)}
                                            className='absolute top-[20px] right-1 rounded-full bg-gray-300 hover:bg-gray-500'
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                {files.length < maxFiles && (
                                    <Button
                                        className='bg-gray-300 text-black hover:bg-gray-500 self-center'
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        Upload more
                                    </Button>
                                )}
                            </>
                        ) : (
                            <div className='flex flex-col items-center gap-2 relative'>
                                <img
                                    src={previews[0]}
                                    alt={`Preview ${0 + 1}`}
                                    className='w-full aspect-square object-contain rounded-md'
                                />
                                <span>{files.name}</span>{' '}
                                {/* Hiển thị tên file nếu files là đối tượng File */}
                                <button
                                    type='button'
                                    onClick={() => handleRemoveFile(0)}
                                    className='absolute top-[20px] right-1 rounded-full bg-gray-300 hover:bg-gray-500'
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Label
                        htmlFor={name}
                        className='flex flex-col items-center justify-center h-32 cursor-pointer'
                    >
                        <UploadCloudIcon className='w-10 h-10 text-muted-foreground mb-2' />
                        <span>Drag & drop or click to upload image</span>
                    </Label>
                )}
            </div>
        </>
    );
}

export default InputFile;
