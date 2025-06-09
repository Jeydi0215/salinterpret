import React, { useState } from 'react';
import { imageDb } from '../utils/firebase-config';
import { getDownloadURL, uploadBytesResumable, ref } from 'firebase/storage';
import { v4 } from 'uuid';
import styled from 'styled-components';
import Navbar from '../components/AdminNavbar';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f8f9fa;
  font-family: 'Inter', 'Segoe UI', sans-serif;
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
`;

const UploadContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const UploadHeader = styled.div`
  background: #4361ee;
  color: white;
  padding: 20px 30px;
  
  h2 {
    margin: 0;
    font-weight: 600;
    font-size: 1.5rem;
  }
  
  p {
    margin: 8px 0 0;
    opacity: 0.9;
    font-size: 0.9rem;
  }
`;

const UploadContent = styled.div`
  display: flex;
  flex-direction: column;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const LeftPanel = styled.div`
  flex: 1;
  padding: 30px;
  
  @media (min-width: 768px) {
    border-right: 1px solid #eaeaea;
  }
`;

const RightPanel = styled.div`
  flex: 1;
  padding: 30px;
  background: #fafbff;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
`;

const InputField = styled.input`
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #f9f9f9;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #4361ee;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
    outline: none;
  }
`;

const SelectField = styled.select`
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #f9f9f9;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  
  &:focus {
    border-color: #4361ee;
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
    outline: none;
  }
`;

const InputFile = styled.input`
  display: none;
`;

const FileUploadArea = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  padding: 30px 20px;
  text-align: center;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 20px;
  
  &:hover {
    border-color: #4361ee;
    background: #f5f7ff;
  }
`;

const FileIcon = styled.div`
  font-size: 2.5rem;
  color: #4361ee;
  margin-bottom: 10px;
`;

const FileUploadText = styled.div`
  font-size: 1rem;
  color: #4b5563;
  margin-bottom: 5px;
`;

const FileTypesText = styled.div`
  font-size: 0.8rem;
  color: #6b7280;
`;

const FileName = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f3f4f6;
  border-radius: 8px;
  margin-top: 15px;
  
  svg {
    color: #4361ee;
    margin-right: 10px;
  }
  
  span {
    font-size: 0.9rem;
    color: #374151;
    word-break: break-all;
  }
`;

const ProgressContainer = styled.div`
  margin-top: 10px;
  margin-bottom: 25px;
`;

const ProgressBarWrapper = styled.div`
  width: 100%;
  height: 10px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: #4361ee;
  border-radius: 999px;
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 0.8rem;
  color: #6b7280;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => props.status === 'success' ? '#d1fae5' : '#fef3c7'};
  color: ${props => props.status === 'success' ? '#065f46' : '#92400e'};
  margin-bottom: 20px;
  
  svg {
    margin-right: 6px;
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.primary ? '#4361ee' : 'transparent'};
  color: ${props => props.primary ? 'white' : '#4361ee'};
  border: ${props => props.primary ? 'none' : '1px solid #4361ee'};
  
  &:hover {
    background: ${props => props.primary ? '#3a56d4' : '#f5f7ff'};
    transform: translateY(-1px);
    box-shadow: ${props => props.primary ? '0 4px 12px rgba(67, 97, 238, 0.15)' : 'none'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    margin-right: 8px;
  }
`;

const FormDivider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 20px 0;
`;

export default function Upload() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setUploadStatus(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setUploadStatus(null);
    }
  };

  const triggerFileInput = () => {
    document.getElementById('file-upload').click();
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
    // Reset category when location changes
    setCategory('');
  };

  const handleUpload = () => {
    if (!file) {
      alert('Please choose a file before uploading.');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a title for the file.');
      return;
    }

    if (!location) {
      alert('Please select a location for the file.');
      return;
    }

    if (location === 'courses' && !category) {
      alert('Please select a category for the course.');
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);
    
    const folderPath = location === 'courses' ? 'courses' : 'easy';
    const fileRef = ref(imageDb, `${folderPath}/${v4()}`);
    const metadata = {
      customMetadata: {
        title,
        tags,
        location,
        ...(location === 'courses' && { category }),
      },
    };

    const uploadTask = uploadBytesResumable(fileRef, file, metadata);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error('Error uploading file:', error);
        setUploadStatus('error');
        setIsUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          console.log('File URL:', url);
          setUploadStatus('success');
          setIsUploading(false);
          
          // Reset form after 2 seconds
          setTimeout(() => {
            setFile(null);
            setFileName('');
            setTitle('');
            setTags('');
            setLocation('');
            setCategory('');
            setProgress(0);
            setUploadStatus(null);
          }, 2000);
        });
      }
    );
  };

  const renderFileIcon = () => {
    if (file && file.type.includes('image')) {
      return '🖼️';
    } else if (file && file.type.includes('video')) {
      return '🎬';
    }
    return '📁';
  };

  return (
    <PageContainer>
      <Navbar />
      <ContentContainer>
        <UploadContainer>
          <UploadHeader>
            <h2>Upload Media</h2>
            <p>Upload images and videos to your gallery</p>
          </UploadHeader>
          <UploadContent>
            <LeftPanel>
              <FormLabel htmlFor="title">Title</FormLabel>
              <InputField
                id="title"
                type="text"
                placeholder="Enter media title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              
              <FormLabel htmlFor="tags">Tags</FormLabel>
              <InputField
                id="tags"
                type="text"
                placeholder="Enter tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              
              <FormLabel htmlFor="location">Location</FormLabel>
              <SelectField
                id="location"
                value={location}
                onChange={handleLocationChange}
              >
                <option value="">Select location</option>
                <option value="courses">Courses</option>
                <option value="main">Main</option>
              </SelectField>
              
              {location === 'courses' && (
                <>
                  <FormLabel htmlFor="category">Category</FormLabel>
                  <SelectField
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Select category</option>
                    <option value="alphabets">Alphabets</option>
                    <option value="common_words">Common Words</option>
                    <option value="Common Phrases">Common Phrases</option>
                  </SelectField>
                </>
              )}
              
              <FormDivider />
              
              <InputFile
                type="file"
                onChange={handleFileChange}
                accept="image/*,video/*"
                id="file-upload"
              />
              
              <FileUploadArea 
                onClick={triggerFileInput}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <FileIcon>
                  {file ? renderFileIcon() : '📤'}
                </FileIcon>
                <FileUploadText>
                  {file ? 'File selected' : 'Drag & drop your file here or click to browse'}
                </FileUploadText>
                <FileTypesText>Supported formats: Images, Videos</FileTypesText>
              </FileUploadArea>
              
              {fileName && (
                <FileName>
                  <span>{renderFileIcon()}</span>
                  <span>{fileName}</span>
                </FileName>
              )}
            </LeftPanel>
            <RightPanel>
              {uploadStatus === 'success' && (
                <StatusBadge status="success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Upload successful!
                </StatusBadge>
              )}
              
              {uploadStatus === 'error' && (
                <StatusBadge status="error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Upload failed. Please try again.
                </StatusBadge>
              )}
              
              {isUploading && (
                <ProgressContainer>
                  <ProgressBarWrapper>
                    <ProgressBarFill progress={progress} />
                  </ProgressBarWrapper>
                  <ProgressText>
                    <span>Uploading...</span>
                    <span>{Math.round(progress)}%</span>
                  </ProgressText>
                </ProgressContainer>
              )}
              
              <Button 
                primary 
                onClick={handleUpload}
                disabled={!file || isUploading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15V3M12 3L7 8M12 3L17 8M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {isUploading ? 'Uploading...' : 'Upload File'}
              </Button>
            </RightPanel>
          </UploadContent>
        </UploadContainer>
      </ContentContainer>
    </PageContainer>
  );
}
