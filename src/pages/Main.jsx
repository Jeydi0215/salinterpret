import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import UserNavbar from '../components/AdminNavbar';
import { getQuizAnalytics } from '../utils/Service'; // Import the function

const AdminPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getQuizAnalytics();
      setAnalyticsData(data);
    };

    fetchData();
  }, []);

  return (
    <Container>
      <UserNavbar isScrolled={false} />
      <Content>
        <Header>
          <h1>Admin Dashboard</h1>
        </Header>
        <MainContent>
          <ContentArea>
            <h2>Data Overview</h2>
            {analyticsData ? (
              <div>
                <h3>Quiz Analytics</h3>
                <pre>{JSON.stringify(analyticsData, null, 2)}</pre> {/* You can format the data to display as per your need */}
              </div>
            ) : (
              <p>Loading analytics data...</p>
            )}
          </ContentArea>
        </MainContent>
      </Content>
    </Container>
  );
};

// Styled components
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
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  margin-top: 100px;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 20px;
`;

export default AdminPage;
