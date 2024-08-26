// src/pages/AdminPage.js
import React from 'react';
import styled from 'styled-components';
import UserNavbar from '../components/AdminNavbar';

const AdminPage = () => {
  return (
    <Container>
      <UserNavbar isScrolled={false} /> 
      <Content>
        <Header>
       
        </Header>
        <MainContent>
          <ContentArea>
            <h2>Data Overview</h2>
            <p>Welcome to the admin dashboard!</p>
            {/* Add your admin content here */}
          </ContentArea>
        </MainContent>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  background-color: #1b1212;
  height: 100vh;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.header`
  background: #141414;
  color: white;
  padding: 20px;
  text-align: center;
  font-size: 1.5em;
  top:0px;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  margin-top:100px;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 20px;
`;

export default AdminPage;
