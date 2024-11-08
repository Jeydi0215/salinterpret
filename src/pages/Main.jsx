// src/pages/AdminPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import UserNavbar from '../components/AdminNavbar';
import { getQuizAnalytics } from '../utils/Service'; 
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminPage = () => {
  const [analyticsData, setAnalyticsData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getQuizAnalytics();
      setAnalyticsData(data);
    };
    fetchData();
  }, []);

  const chartData = analyticsData.map((item) => ({
    date: item.timestamp.toDate().toLocaleDateString(),
    score: item.score,
    attempts: item.attempts,
  }));

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
            <p>Welcome to the admin dashboard!</p>

            {/* Display the graph */}
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#8884d8" />
                <Line type="monotone" dataKey="attempts" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
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
  top: 0;
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
