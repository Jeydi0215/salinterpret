import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Initialize Firebase Auth and Firestore
const auth = getAuth();
const db = getFirestore();

// Function to fetch analytics data
const fetchAnalyticsData = async () => {
  // Get the current user
  const user = auth.currentUser;

  // Check if the user is authenticated
  if (!user) {
    console.error("User is not authenticated.");
    return;
  }

  // Define the document reference to fetch analytics data
  const analyticsDocRef = doc(db, "analytics", "yourDocumentId");

  try {
    // Fetch the document from Firestore
    const docSnap = await getDoc(analyticsDocRef);

    if (docSnap.exists()) {
      // Successfully fetched the document
      console.log("Analytics Data:", docSnap.data());
    } else {
      // Document does not exist
      console.log("No analytics data found.");
    }
  } catch (error) {
    console.error("Error fetching analytics data:", error);
  }
};

// Call the function to fetch the data
fetchAnalyticsData();
