import React, { useEffect, useState } from 'react';
import { firebaseFirestore } from '../utils/firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import AdminNavbar from '../components/AdminNavbar';

const AdminStats = () => {
  const [quizData, setQuizData] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        console.log('Fetching quiz results...');
        setIsLoading(true);
        
        // Get quiz results
        const quizResultsRef = collection(firebaseFirestore, "quizResults");
        console.log('Collection reference created for quizResults');
        
        const snapshot = await getDocs(quizResultsRef);
        console.log(`Got ${snapshot.size} documents from Firestore`);
        
        // Process all quiz results
        const allResults = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          console.log('Document data:', data);
          allResults.push({
            id: doc.id,
            ...data,
            // Convert server timestamp to display date
            displayDate: data.timestamp?.toDate ? 
              data.timestamp.toDate().toLocaleString() : 
              'Unknown date'
          });
        });
        
        // Sort by timestamp (newest first)
        allResults.sort((a, b) => {
          if (!a.timestamp || !b.timestamp) return 0;
          return b.timestamp.seconds - a.timestamp.seconds;
        });
        
        console.log('Processed quiz results:', allResults);
        setQuizData(allResults);
        
        // Process user stats by email
        const userScores = {};
        allResults.forEach(result => {
          // Use email as the primary identifier, falling back to userId if email not available
          const userIdentifier = result.email || result.userId || 'Unknown';
          
          if (!userScores[userIdentifier]) {
            userScores[userIdentifier] = {
              email: result.email || 'Anonymous',
              userId: result.userId,
              userName: result.userName || 'Anonymous User',
              scores: [],
              attempts: 0,
              totalCorrect: 0,
              totalQuestions: 0
            };
          }
          
          userScores[userIdentifier].scores.push(result.score || 0);
          userScores[userIdentifier].attempts += 1;
          userScores[userIdentifier].totalCorrect += result.score || 0;
          userScores[userIdentifier].totalQuestions += result.totalQuestions || 0;
        });
        
        // Calculate averages and format for display
        const userStatsArray = Object.values(userScores).map(user => {
          const avgScore = user.scores.length > 0 && user.totalQuestions > 0
            ? (user.totalCorrect / user.totalQuestions * 100).toFixed(1)
            : 0;
            
          return {
            ...user,
            avgScore: `${avgScore}%`,
            correctRatio: `${user.totalCorrect}/${user.totalQuestions}`
          };
        });
        
        // Sort by attempts (highest first)
        userStatsArray.sort((a, b) => b.attempts - a.attempts);
        
        console.log('Processed user stats:', userStatsArray);
        setUserStats(userStatsArray);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError(`Failed to load quiz data: ${err.message}`);
        setIsLoading(false);
      }
    };

    fetchQuizResults();
  }, []);

  // Style constants
  const styles = {
    container: {
      padding: '30px',
      background: 'linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%)',
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'Poppins, sans-serif'
    },
    contentContainer: {
      marginTop: '100px', // Add space below navbar
      padding: '0 20px'
      
    },
    header: {
      fontSize: '28px',
      fontWeight: 600,
      marginBottom: '30px',
      background: 'linear-gradient(90deg, #41bfde 0%, #4e7fff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      display: 'inline-block'
    },
    section: {
      marginBottom: '40px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '25px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: 500,
      marginBottom: '20px',
      color: '#e0e0e0'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '15px'
    },
    tableHeader: {
      background: 'rgba(65, 191, 222, 0.15)',
      color: '#41bfde',
      textAlign: 'left',
      padding: '12px 15px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    tableCell: {
      padding: '12px 15px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    },
    evenRow: {
      background: 'rgba(255, 255, 255, 0.02)'
    },
    oddRow: {
      background: 'rgba(255, 255, 255, 0.05)'
    },
    loadingOrError: {
      textAlign: 'center',
      padding: '30px',
      fontSize: '18px',
      color: '#999'
    },
    scoreHighlight: {
      fontWeight: 'bold',
      color: '#41bfde'
    },
    debugSection: {
      margin: '20px 0',
      padding: '15px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '5px',
      border: '1px solid #333',
      display: 'none' // Set to 'block' to show debug info
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <AdminNavbar />
        <div style={styles.contentContainer}>
          <h2 style={styles.header}>Gamification Stats</h2>
          <div style={styles.loadingOrError}>Loading quiz data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <AdminNavbar />
        <div style={styles.contentContainer}>
          <h2 style={styles.header}>Gamification Stats</h2>
          <div style={styles.loadingOrError}>{error}</div>
        </div>
      </div>
    );
  }

  // Debug information (hidden by default)
  const debugInfo = {
    quizDataLength: quizData.length,
    userStatsLength: userStats.length,
    firebaseFirestore: !!firebaseFirestore ? 'Available' : 'Not Available'
  };

  return (
    <div style={styles.container}>
      <AdminNavbar />
      <div style={styles.contentContainer}>
        <h2 style={styles.header}>Gamification Stats</h2>
        
        {/* Debug information (hidden by default) */}
        <div style={styles.debugSection}>
          <h3>Debug Information</h3>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
        
        {/* User Statistics Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>User Performance</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Email</th>
                <th style={styles.tableHeader}>Attempts</th>
                <th style={styles.tableHeader}>Correct Answers</th>
                <th style={styles.tableHeader}>Average Score</th>
              </tr>
            </thead>
            <tbody>
              {userStats.length > 0 ? (
                userStats.map((user, index) => (
                  <tr key={user.userId || index} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                    <td style={styles.tableCell}>{user.email}</td>
                    <td style={styles.tableCell}>{user.attempts}</td>
                    <td style={styles.tableCell}>{user.correctRatio}</td>
                    <td style={styles.tableCell}>
                      <span style={styles.scoreHighlight}>{user.avgScore}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{...styles.tableCell, textAlign: 'center'}}>
                    No quiz data available yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Recent Quiz Results Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Recent Quiz Results</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Date</th>
                <th style={styles.tableHeader}>Email</th>
                <th style={styles.tableHeader}>Score</th>
                <th style={styles.tableHeader}>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {quizData.length > 0 ? (
                quizData.slice(0, 10).map((result, index) => (
                  <tr key={result.id} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                    <td style={styles.tableCell}>{result.displayDate}</td>
                    <td style={styles.tableCell}>{result.email || 'Anonymous'}</td>
                    <td style={styles.tableCell}>{result.score}/{result.totalQuestions}</td>
                    <td style={styles.tableCell}>
                      <span style={styles.scoreHighlight}>{result.percentage}%</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{...styles.tableCell, textAlign: 'center'}}>
                    No recent quiz results
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
