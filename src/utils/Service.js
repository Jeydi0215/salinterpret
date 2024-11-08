import { db } from './firebase-config'; // Make sure to import your Firestore config
import { doc, getDoc } from 'firebase/firestore';

// Function to get quiz analytics data
export const getQuizAnalytics = async () => {
  // Fetch the analytics data from Firestore
  const analyticsDocRef = doc(db, "analytics", "yourDocumentId"); // Replace with actual document ID

  try {
    const docSnap = await getDoc(analyticsDocRef);
    
    if (docSnap.exists()) {
      // Return the fetched data
      return docSnap.data(); // Return the data as an object
    } else {
      console.error("No analytics data found.");
      return null; // Return null if no data found
    }
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return null; // Return null in case of an error
  }
};
