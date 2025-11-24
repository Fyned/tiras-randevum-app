import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BarberImageUpload = ({ onFileSelect, currentImageUrl }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(currentImageUrl || null);
    const [isDragging, setIsDragging] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setPreview(currentImageUrl);
    }, [currentImageUrl]);

    const handleFileChange = (selectedFile) => {
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            onFileSelect(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        } else {
            toast({ variant: "destructive", title: "Geçersiz Dosya", description: "Lütfen bir resim dosyası seçin." });
        }
    };

    const handleInputChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFileChange(selectedFile);
        }
    };
    
    const handleDragEvents = (e, dragging) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    };

    const handleDrop = (e) => {
        handleDragEvents(e, false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            handleFileChange(droppedFile);
        }
    };

    const removeFile = () => {
        setFile(null);
        setPreview(currentImageUrl || null); // Revert to original or null
        onFileSelect(null);
    };

    return (
        <div className="w-full space-y-4">
            {preview ? (
                <div className="relative w-32 h-32 mx-auto">
                    <img src={preview} alt="Önizleme" className="w-full h-full object-cover rounded-full" />
                    <Button variant="destructive" size="icon" className="absolute top-0 right-0 h-8 w-8 rounded-full" onClick={removeFile}>
                        <X size={16} />
                    </Button>
                </div>
            ) : (
                <div
                    onDragEnter={(e) => handleDragEvents(e, true)}
                    onDragLeave={(e) => handleDragEvents(e, false)}
                    onDragOver={(e) => handleDragEvents(e, true)}
                    onDrop={handleDrop}
                    className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-[color:var(--tr-accent)] bg-[color:var(--tr-accent-soft)]' : 'border-[color:var(--tr-border-strong)] hover:border-[color:var(--tr-accent)]'}`}
                >
                    <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleInputChange} />
                    <label htmlFor="dropzone-file" className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-center p-4">
                        <UploadCloud className={`w-10 h-10 mb-3 text-[color:var(--tr-text-muted)] ${isDragging ? 'text-[color:var(--tr-accent)]' : ''}`} />
                        <p className={`font-semibold ${isDragging ? 'text-[color:var(--tr-accent)]' : ''}`}>Tıkla veya sürükle bırak</p>
                        <p className="text-xs text-[color:var(--tr-text-muted)]">PNG, JPG veya GIF</p>
                    </label>
                </div>
            )}
        </div>
    );
};

export default BarberImageUpload;