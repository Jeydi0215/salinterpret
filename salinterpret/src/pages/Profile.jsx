import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Navbar from '../components/AdminNavbar';

const ProfileInfo = ({ profilePicture, setProfilePicture, username, setUsername, name, setName, bio, setBio, saveProfileData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newProfilePicture, setNewProfilePicture] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newBio, setNewBio] = useState('');

  useEffect(() => {
    setNewProfilePicture(profilePicture);
    setNewUsername(username);
    setNewName(name);
    setNewBio(bio);
  }, [profilePicture, username, name, bio]);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      setNewProfilePicture(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleSaveChanges = () => {
    setProfilePicture(newProfilePicture);
    setUsername(newUsername);
    setName(newName);
    setBio(newBio);
    saveProfileData();
    setIsEditing(false);
  };

  return (
    <ProfileInfoContainer>
      <Avatar src={newProfilePicture} alt="Avatar" />
      {isEditing ? (
        <EditForm>
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
          />
          <Input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Username"
          />
          <Input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
          />
          <BioTextArea
            value={newBio}
            onChange={(e) => setNewBio(e.target.value)}
            placeholder="Bio"
          ></BioTextArea>
          <SaveButton onClick={handleSaveChanges}>Save Changes</SaveButton>
        </EditForm>
      ) : (
        <UserInfo>
          <h2>{username}</h2>
          <p>{name}</p>
          <p>{bio}</p>
          <EditButton onClick={() => setIsEditing(true)}>Edit</EditButton>
        </UserInfo>
      )}
    </ProfileInfoContainer>
  );
};

const ProfilePage = () => {
  const [profilePicture, setProfilePicture] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const savedProfilePicture = localStorage.getItem('profilePicture');
    const savedUsername = localStorage.getItem('username');
    const savedName = localStorage.getItem('name');
    const savedBio = localStorage.getItem('bio');

    if (savedProfilePicture) {
      setProfilePicture(savedProfilePicture);
    }
    if (savedUsername) {
      setUsername(savedUsername);
    }
    if (savedName) {
      setName(savedName);
    }
    if (savedBio) {
      setBio(savedBio);
    }
    const mockRecentActivities = [
      { id: 1, image: 'https://via.placeholder.com/150' },
      { id: 2, image: 'https://via.placeholder.com/150' },
      { id: 3, image: 'https://via.placeholder.com/150' }
    ];
    setRecentActivities(mockRecentActivities);
  }, []);

  const saveProfileData = () => {
    localStorage.setItem('profilePicture', profilePicture);
    localStorage.setItem('username', username);
    localStorage.setItem('name', name);
    localStorage.setItem('bio', bio);
  };

  return (
    <Container>
      <Navbar />
      <ProfileInfo
        profilePicture={profilePicture}
        setProfilePicture={setProfilePicture}
        username={username}
        setUsername={setUsername}
        name={name}
        setName={setName}
        bio={bio}
        setBio={setBio}
        saveProfileData={saveProfileData}
      />
      <RecentActivities>
        <h2>Recent Activities</h2>
        <ActivityList>
          {recentActivities.map(activity => (
            <ActivityItem key={activity.id}>
              <ActivityImage src={activity.image} alt="Activity" />
            </ActivityItem>
          ))}
        </ActivityList>
      </RecentActivities>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const ProfileInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;

const Avatar = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin-top:50%;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  input, textarea {
    margin-bottom: 20px;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 300px;
  }
`;

const Input = styled.input`
  &:focus, &:active {
    outline: none;
    border-color: #007bff;
  }
`;

const BioTextArea = styled.textarea`
  height: 150px;
  resize: none;

  &:focus, &:active {
    outline: none;
    border-color: #007bff;
  }
`;

const SaveButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #0056b3;
  }
`;

const EditButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #0056b3;
  }
`;

const RecentActivities = styled.div`
  width: 100%;
  text-align: center;
`;

const ActivityList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const ActivityItem = styled.li`
  margin: 0 10px 20px;
`;

const ActivityImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.1);
  }
`;

export default ProfilePage;
