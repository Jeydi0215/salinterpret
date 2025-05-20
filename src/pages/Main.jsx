import React, { useEffect, useState } from 'react';
import { getStorage, ref, listAll, getDownloadURL, getMetadata, deleteObject } from 'firebase/storage';
import AdminNavbar from '../components/AdminNavbar';
import styled from 'styled-components';
import { FaPlay, FaSearch, FaTimes, FaTrash, FaPlusCircle, FaEdit, FaImage, FaVideo } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminMain = () => {
  // State declarations
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaItems, setMediaItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [sortCriteria, setSortCriteria] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [contentType, setContentType] = useState('videos');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  
  const navigate = useNavigate();
  const storage = getStorage();

  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch media items from Firebase
  useEffect(() => {
    const fetchMediaItems = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const folderPath = contentType === 'videos' ? 'easy' : 'courses';
        const mediaRef = ref(storage, folderPath);
        const mediaList = await listAll(mediaRef);
        
        const itemPromises = mediaList.items.map(async (item) => {
          try {
            const url = await getDownloadURL(item);
            const metadata = await getMetadata(item);
            const customData = metadata.customMetadata || {};
            
            return { 
              id: item.name,
              url, 
              title: customData.title || item.name,
              timestamp: metadata.timeCreated,
              size: metadata.size,
              type: metadata.contentType,
              path: item.fullPath
            };
          } catch (error) {
            console.error("Error fetching item:", error);
            return null;
          }
        });
        
        const results = await Promise.all(itemPromises);
        setMediaItems(results.filter(item => item !== null));
      } catch (error) {
        console.error('Error fetching media items:', error);
        setError('Failed to load media. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMediaItems();
  }, [storage, contentType]);

  // Video player functions
  const playVideo = (e, url, title) => {
    e.stopPropagation();
    setSelectedVideoUrl(url);
    setSelectedVideoTitle(title);
    document.body.style.overflow = 'hidden';
  };

  const closeVideo = () => {
    setSelectedVideoUrl(null);
    setSelectedVideoTitle(null);
    document.body.style.overflow = 'auto';
  };

  // Edit functions
  const openEditModal = (item) => {
    setCurrentEditItem(item);
    setEditTitle(item.title);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setCurrentEditItem(null);
    setEditTitle('');
  };

  const handleEditTitleChange = (e) => {
    setEditTitle(e.target.value);
  };

  const saveEdit = async () => {
    try {
      // In a real implementation, you would update the metadata in Firebase here
      // For now, we'll just update the local state
      setMediaItems(prevItems => 
        prevItems.map(item => 
          item.id === currentEditItem.id 
            ? { ...item, title: editTitle } 
            : item
        )
      );
      showToast(`${contentType === 'videos' ? 'Video' : 'Course image'} updated successfully`);
      closeEditModal();
    } catch (error) {
      console.error("Error updating item:", error);
      showToast(`Failed to update ${contentType === 'videos' ? 'video' : 'course image'}`, "error");
    }
  };

  // Search functions
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Delete functions
  const initiateDelete = (e, id) => {
    e.stopPropagation();
    setConfirmDelete(id);
  };
  
  const cancelDelete = (e) => {
    e.stopPropagation();
    setConfirmDelete(null);
  };
  
  const confirmDeleteVideo = async (e, path) => {
    e.stopPropagation();
    try {
      const videoRef = ref(storage, path);
      await deleteObject(videoRef);
      setMediaItems(prevItems => prevItems.filter(item => item.id !== confirmDelete));
      setConfirmDelete(null);
      showToast(`${contentType === 'videos' ? 'Video' : 'Course image'} deleted successfully`);
    } catch (error) {
      console.error("Error deleting media:", error);
      showToast(`Failed to delete ${contentType === 'videos' ? 'video' : 'course image'}`, "error");
    }
  };
  
  // Toast notification
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  
  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Sorting function
  const handleSortChange = (e) => {
    setSortCriteria(e.target.value);
  };
  
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Toggle between videos and images
  const toggleContentType = () => {
    setContentType(prev => prev === 'videos' ? 'images' : 'videos');
    setSearchQuery('');
  };
  
  // Sort and filter media items
  const sortedAndFilteredItems = React.useMemo(() => {
    let filtered = mediaItems.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return filtered.sort((a, b) => {
      let valueA, valueB;
      
      if (sortCriteria === 'date') {
        valueA = new Date(a.timestamp);
        valueB = new Date(b.timestamp);
      } else if (sortCriteria === 'name') {
        valueA = a.title.toLowerCase();
        valueB = b.title.toLowerCase();
      } else if (sortCriteria === 'size') {
        valueA = a.size;
        valueB = b.size;
      }
      
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  }, [mediaItems, searchQuery, sortCriteria, sortDirection]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if file is an image
  const isImage = (fileType) => {
    return fileType.startsWith('image/');
  };

  return (
    <PageContainer>
      <AdminNavbar isScrolled={isScrolled} />
      
      <AdminHeader>
        <h1>{contentType === 'videos' ? 'Video' : 'Course Image'} Management</h1>
        <AdminActions>
          <ContentTypeToggle onClick={toggleContentType}>
            {contentType === 'videos' ? <FaImage /> : <FaVideo />}
            {contentType === 'videos' ? 'View Course Images' : 'View Videos'}
          </ContentTypeToggle>
          <UploadButton onClick={() => navigate(contentType === 'videos' ? '/upload' : '/upload')}>
            <FaPlusCircle /> Add New {contentType === 'videos' ? 'Video' : 'Course Image'}
          </UploadButton>
        </AdminActions>
      </AdminHeader>
      
      <ContentWrapper>
        {/* Search and Filters */}
        <ControlsSection>
          <SearchWrapper>
            <SearchIcon><FaSearch /></SearchIcon>
            <SearchBar
              type="text"
              placeholder={`Search ${contentType === 'videos' ? 'videos' : 'course images'} by title...`}
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <ClearButton onClick={clearSearch}>
                <FaTimes />
              </ClearButton>
            )}
          </SearchWrapper>
          
          <FilterSection>
            <SortByControl>
              <label htmlFor="sortBy">Sort by:</label>
              <select id="sortBy" value={sortCriteria} onChange={handleSortChange}>
                <option value="date">Date</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
              </select>
            </SortByControl>
            
            <SortDirectionButton onClick={toggleSortDirection}>
              {sortDirection === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </SortDirectionButton>
          </FilterSection>
        </ControlsSection>
        
        <MediaCount>
          {sortedAndFilteredItems.length} {contentType === 'videos' ? 'video' : 'course image'}{sortedAndFilteredItems.length !== 1 ? 's' : ''} available
          {searchQuery && ` for "${searchQuery}"`}
        </MediaCount>
        
        {/* Content Area */}
        {isLoading ? (
          <LoadingContainer>
            <LoadingSpinner />
            <p>Loading {contentType === 'videos' ? 'videos' : 'course images'}...</p>
          </LoadingContainer>
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : sortedAndFilteredItems.length === 0 ? (
          <EmptyState>
            <p>No {contentType === 'videos' ? 'videos' : 'course images'} found{searchQuery ? ' matching your search' : ''}.</p>
            {searchQuery && <ResetButton onClick={clearSearch}>Clear Search</ResetButton>}
          </EmptyState>
        ) : (
          <VideoTable>
            <TableHeader>
              <tr>
                <th>Preview</th>
                <th>Title</th>
                <th>Uploaded</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredItems.map((item, index) => (
                <TableRow 
                  key={item.id} 
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  isHovered={hoveredIndex === index}
                >
                  <ThumbnailCell>
                    {isImage(item.type) ? (
                      <ImageThumbnailContainer>
                        <ImageThumbnail src={item.url} alt={item.title} />
                      </ImageThumbnailContainer>
                    ) : (
                      <VideoThumbnailContainer>
                        <VideoThumbnail src={item.url} muted />
                        <ThumbnailOverlay>
                          <PlayButton onClick={(e) => playVideo(e, item.url, item.title)}>
                            <FaPlay />
                          </PlayButton>
                        </ThumbnailOverlay>
                      </VideoThumbnailContainer>
                    )}
                  </ThumbnailCell>
                  <TitleCell>{item.title}</TitleCell>
                  <DateCell>{formatDate(item.timestamp)}</DateCell>
                  <SizeCell>{formatFileSize(item.size)}</SizeCell>
                  <ActionsCell>
                    {confirmDelete === item.id ? (
                      <DeleteConfirmation>
                        <DeleteConfirmButton onClick={(e) => confirmDeleteVideo(e, item.path)}>
                          Confirm
                        </DeleteConfirmButton>
                        <DeleteCancelButton onClick={cancelDelete}>
                          Cancel
                        </DeleteCancelButton>
                      </DeleteConfirmation>
                    ) : (
                      <>
                        <ActionButton edit onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(item);
                        }}>
                          <FaEdit />
                        </ActionButton>
                        <ActionButton delete onClick={(e) => initiateDelete(e, item.id)}>
                          <FaTrash />
                        </ActionButton>
                        {!isImage(item.type) && (
                          <ActionButton play onClick={(e) => playVideo(e, item.url, item.title)}>
                            <FaPlay />
                          </ActionButton>
                        )}
                      </>
                    )}
                  </ActionsCell>
                </TableRow>
              ))}
            </TableBody>
          </VideoTable>
        )}
      </ContentWrapper>
      
      {/* Video Player Modal */}
      {selectedVideoUrl && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h3>{selectedVideoTitle}</h3>
              <CloseButton onClick={closeVideo}><FaTimes /></CloseButton>
            </ModalHeader>
            <VideoPlayer
              src={selectedVideoUrl}
              controls
              autoPlay
            />
          </ModalContent>
        </Modal>
      )}
      
      {/* Edit Modal */}
      {editModalOpen && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h3>Edit {contentType === 'videos' ? 'Video' : 'Course Image'}</h3>
              <CloseButton onClick={closeEditModal}><FaTimes /></CloseButton>
            </ModalHeader>
            <EditForm>
              <FormGroup>
                <Label>Title</Label>
                <Input
                  type="text"
                  value={editTitle}
                  onChange={handleEditTitleChange}
                  placeholder="Enter new title"
                />
              </FormGroup>
              <PreviewContainer>
                {isImage(currentEditItem.type) ? (
                  <ImagePreview src={currentEditItem.url} alt={currentEditItem.title} />
                ) : (
                  <VideoPreview src={currentEditItem.url} muted />
                )}
              </PreviewContainer>
              <ButtonGroup>
                <CancelButton onClick={closeEditModal}>Cancel</CancelButton>
                <SaveButton onClick={saveEdit}>Save Changes</SaveButton>
              </ButtonGroup>
            </EditForm>
          </ModalContent>
        </Modal>
      )}
      
      {/* Toast Notification */}
      {toast.visible && (
        <ToastNotification type={toast.type}>
          {toast.message}
        </ToastNotification>
      )}
      
      <Footer>
        <p>&copy; {new Date().getFullYear()} Numbros Admin Panel</p>
      </Footer>
    </PageContainer>
  );
};

// Styled Components (updated with new modal styles)
const PageContainer = styled.div`
  background-color: #f5f7fa;
  color: #333;
  min-height: 100vh;
  position: relative;
  padding-bottom: 60px;
`;

const AdminHeader = styled.header`
  padding: 2rem 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-top: 100px;
  
  h1 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 600;
    color: #1a1a1a;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const AdminActions = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
  }
`;

const ContentTypeToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  
  &:hover {
    background-color: #0b7dda;
  }
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #3e8e41;
  }
`;

const ContentWrapper = styled.main`
  padding: 1.5rem 5%;
`;

const ControlsSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 450px;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 12px;
  color: #777;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.7rem 2.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: white;
  color: #333;
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #777;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #333;
  }
`;

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const SortByControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  label {
    font-size: 0.9rem;
    color: #666;
  }
  
  select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    cursor: pointer;
    
    &:focus {
      outline: none;
      border-color: #4a90e2;
    }
  }
`;

const SortDirectionButton = styled.button`
  padding: 0.5rem 0.8rem;
  background-color: #f2f4f6;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #e7e9eb;
  }
`;

const MediaCount = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
`;

const VideoTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  overflow: hidden;
`;

const TableHeader = styled.thead`
  background-color: #f2f4f6;
  
  th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #444;
    border-bottom: 1px solid #e0e0e0;
    white-space: nowrap;
  }
`;

const TableBody = styled.tbody`
  tr:not(:last-child) {
    border-bottom: 1px solid #e0e0e0;
  }
`;

const TableRow = styled.tr`
  transition: background-color 0.2s;
  background-color: ${props => props.isHovered ? '#f9f9f9' : 'white'};
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  vertical-align: middle;
`;

const ThumbnailCell = styled(TableCell)`
  width: 160px;
  padding: 0.5rem 1rem;
`;

const VideoThumbnailContainer = styled.div`
  position: relative;
  width: 140px;
  height: 80px;
  overflow: hidden;
  border-radius: 4px;
  background-color: #000;
`;

const VideoThumbnail = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
`;

const ThumbnailOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${VideoThumbnailContainer}:hover & {
    opacity: 1;
  }
`;

const PlayButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ImageThumbnailContainer = styled.div`
  position: relative;
  width: 140px;
  height: 80px;
  overflow: hidden;
  border-radius: 4px;
  background-color: #f0f0f0;
`;

const ImageThumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TitleCell = styled(TableCell)`
  font-weight: 500;
  color: #333;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DateCell = styled(TableCell)`
  color: #666;
  white-space: nowrap;
`;

const SizeCell = styled(TableCell)`
  color: #666;
  white-space: nowrap;
`;

const ActionsCell = styled(TableCell)`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  white-space: nowrap;
`;

const ActionButton = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${props => {
    if (props.delete) return '#ffebee';
    if (props.edit) return '#e3f2fd';
    return '#f2f4f6';
  }};
  color: ${props => {
    if (props.delete) return '#f44336';
    if (props.edit) return '#2196f3';
    return '#424242';
  }};
  
  &:hover {
    background-color: ${props => {
      if (props.delete) return '#ffcdd2';
      if (props.edit) return '#bbdefb';
      return '#e0e0e0';
    }};
  }
`;

const DeleteConfirmation = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const DeleteConfirmButton = styled.button`
  padding: 0.4rem 0.7rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #d32f2f;
  }
`;

const DeleteCancelButton = styled.button`
  padding: 0.4rem 0.7rem;
  background-color: #f2f4f6;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  width: 100%;
  max-width: 900px;
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f2f4f6;
  border-bottom: 1px solid #e0e0e0;
  
  h3 {
    margin: 0;
    color: #333;
    font-weight: 500;
  }
`;

const VideoPlayer = styled.video`
  width: 100%;
  max-height: 80vh;
  background-color: black;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

// New styled components for edit modal
const EditForm = styled.div`
  padding: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

const PreviewContainer = styled.div`
  margin: 1.5rem 0;
  display: flex;
  justify-content: center;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
`;

const VideoPreview = styled.video`
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #f2f4f6;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #e7e9eb;
  }
`;

const SaveButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #3e8e41;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #4a90e2;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ResetButton = styled.button`
  background: none;
  border: 1px solid #ddd;
  color: #333;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #f2f4f6;
  }
`;

const ToastNotification = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  background-color: ${props => props.type === 'error' ? '#f44336' : '#4CAF50'};
  color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const Footer = styled.footer`
  background-color: white;
  text-align: center;
  padding: 1rem;
  position: absolute;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e0e0e0;
  
  p {
    margin: 0;
    font-size: 0.9rem;
    color: #666;
  }
`;

export default AdminMain;
