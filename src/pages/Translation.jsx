import React, { useState, useEffect } from "react";
import styled from "styled-components";

// Reusing your styled components with some modifications
const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #2b6cb0;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const SubTitle = styled.p`
  color: #4a5568;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 3rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: stretch;
    text-align: left;
  }
`;

const HeroContent = styled.div`
  flex: 1;
  padding: 1rem;
  @media (min-width: 768px) {
    padding-right: 2rem;
  }
`;

const HeroTitle = styled.h2`
  color: #2c5282;
  font-size: 1.8rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const HeroDescription = styled.p`
  color: #4a5568;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const FeatureList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin-bottom: 1.5rem;
  
  li {
    padding: 0.5rem 0;
    position: relative;
    padding-left: 1.8rem;
    text-align: left;
    
    &:before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #38a169;
      font-weight: bold;
    }
  }
`;

const HeroImage = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  
  img {
    max-width: 100%;
    max-height: 300px;
    border-radius: 16px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

const DownloadSection = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  color: #2c5282;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const DownloadOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  margin: 2rem 0;
`;

const DownloadOption = styled.div`
  flex: 1;
  min-width: 200px;
  max-width: 250px;
  padding: 1.5rem;
  background-color: ${props => props.highlighted ? '#ebf8ff' : '#f7fafc'};
  border-radius: 12px;
  border: 2px solid ${props => props.highlighted ? '#4299e1' : 'transparent'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(66, 153, 225, 0.2);
  }
`;

const PlatformIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #3182ce;
`;

const PlatformName = styled.h3`
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const PlatformDetails = styled.p`
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const DownloadButton = styled.a`
  display: inline-block;
  background-color: #4299e1;
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  
  &:hover {
    background-color: #3182ce;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(49, 130, 206, 0.3);
  }
`;

const RecommendedBadge = styled.span`
  display: inline-block;
  background-color: #38a169;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  margin-top: 0.5rem;
`;

const InstallationSteps = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
`;

const Step = styled.div`
  flex: 1;
  min-width: 200px;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  text-align: center;
  
  @media (min-width: 768px) {
    min-width: 150px;
  }
`;

const StepNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #4299e1;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  border-radius: 50%;
  margin: 0 auto 1rem;
`;

const StepTitle = styled.h3`
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const StepDescription = styled.p`
  color: #718096;
  font-size: 0.9rem;
`;

const FAQSection = styled.div`
  margin-top: 3rem;
  padding: 1rem;
`;

const FAQItem = styled.div`
  margin-bottom: 1.5rem;
  text-align: left;
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FAQQuestion = styled.h3`
  color: #2d3748;
  margin-bottom: 0.75rem;
  font-weight: 600;
  font-size: 1.1rem;
`;

const FAQAnswer = styled.p`
  color: #4a5568;
  line-height: 1.6;
`;

// Icons for platforms
const WindowsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#0078D6">
    <path d="M0,3.4v7.9l9.3-1.3V3.4L0,3.4z M10.7,3.4v7.9l9.3-1.3V3.4L10.7,3.4z M0,12.8v7.9h9.3v-9.2L0,12.8z M10.7,11.5v9.2H20v-7.9L10.7,11.5z"/>
  </svg>
);

const MacIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#999999">
    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
  </svg>
);

const LinuxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#333333">
    <path d="M13.18,14.5C12.53,15.26 11.47,15.26 10.82,14.5L7.44,9.44L10.82,4.5C11.46,3.74 12.53,3.74 13.18,4.5L16.56,9.44L13.18,14.5M14.46,14.66L11.3,19.5H5.27L2.27,14.66C1.73,13.77 1.79,12.61 2.39,11.67L5.27,4.5H18.73L21.61,11.67C22.21,12.61 22.27,13.77 21.73,14.66L18.73,19.5H12.7L9.54,14.66" />
  </svg>
);

function ASLTranslator() {
  const [os, setOs] = useState(null);
  
  // Detect user's operating system
  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    if (userAgent.indexOf("Windows") !== -1) setOs("windows");
    else if (userAgent.indexOf("Mac") !== -1) setOs("mac");
    else if (userAgent.indexOf("Linux") !== -1) setOs("linux");
    else setOs("unknown");
  }, []);
  
  // Replace these with your actual download links
  const downloadLinks = {
    windows: "https://drive.google.com/file/d/your-windows-file-id/view",
    mac: "https://drive.google.com/file/d/your-mac-file-id/view",
    linux: "https://drive.google.com/file/d/your-linux-file-id/view"
  };

  return (
    <Container>
      <Title>ASL Translator</Title>
      <SubTitle>Translate American Sign Language in real-time using your camera</SubTitle>
      
      <Hero>
        <HeroContent>
          <HeroTitle>Real-time Sign Language Translation</HeroTitle>
          <HeroDescription>
            Our ASL Translator uses advanced computer vision and machine learning to convert 
            American Sign Language into text instantly. Perfect for learning ASL or 
            bridging communication gaps.
          </HeroDescription>
          <FeatureList>
            <li>High accuracy recognition of ASL alphabet</li>
            <li>Real-time translation through your webcam</li>
            <li>Privacy-focused (works offline)</li>
            <li>Easy to use with a simple interface</li>
          </FeatureList>
        </HeroContent>
        <HeroImage>
          <img src="/images/asl-translator-demo.jpg" alt="ASL Translator Demo" />
        </HeroImage>
      </Hero>
      
      <DownloadSection>
        <SectionTitle>Download ASL Translator</SectionTitle>
        <p>Select your operating system to download the latest version</p>
        
        <DownloadOptions>
          <DownloadOption highlighted={os === 'windows'}>
            <PlatformIcon><WindowsIcon /></PlatformIcon>
            <PlatformName>Windows</PlatformName>
            <PlatformDetails>For Windows 10 and 11</PlatformDetails>
            <DownloadButton href={downloadLinks.windows} target="_blank" rel="noopener noreferrer">
              Download
            </DownloadButton>
            {os === 'windows' && <RecommendedBadge>Recommended</RecommendedBadge>}
          </DownloadOption>
          
          <DownloadOption highlighted={os === 'mac'}>
            <PlatformIcon><MacIcon /></PlatformIcon>
            <PlatformName>macOS</PlatformName>
            <PlatformDetails>For macOS 10.14 and newer</PlatformDetails>
            <DownloadButton href={downloadLinks.mac} target="_blank" rel="noopener noreferrer">
              Download
            </DownloadButton>
            {os === 'mac' && <RecommendedBadge>Recommended</RecommendedBadge>}
          </DownloadOption>
          
          <DownloadOption highlighted={os === 'linux'}>
            <PlatformIcon><LinuxIcon /></PlatformIcon>
            <PlatformName>Linux</PlatformName>
            <PlatformDetails>For Ubuntu, Debian, and more</PlatformDetails>
            <DownloadButton href={downloadLinks.linux} target="_blank" rel="noopener noreferrer">
              Download
            </DownloadButton>
            {os === 'linux' && <RecommendedBadge>Recommended</RecommendedBadge>}
          </DownloadOption>
        </DownloadOptions>
      </DownloadSection>
      
      <SectionTitle>Easy Installation</SectionTitle>
      <InstallationSteps>
        <Step>
          <StepNumber>1</StepNumber>
          <StepTitle>Download</StepTitle>
          <StepDescription>
            Download the appropriate version for your operating system
          </StepDescription>
        </Step>
        
        <Step>
          <StepNumber>2</StepNumber>
          <StepTitle>Install</StepTitle>
          <StepDescription>
            Run the installer and follow the on-screen instructions
          </StepDescription>
        </Step>
        
        <Step>
          <StepNumber>3</StepNumber>
          <StepTitle>Launch</StepTitle>
          <StepDescription>
            Open the ASL Translator from your desktop or applications folder
          </StepDescription>
        </Step>
      </InstallationSteps>
      
      <FAQSection>
        <SectionTitle>Frequently Asked Questions</SectionTitle>
        
        <FAQItem>
          <FAQQuestion>Why is the ASL Translator a separate download?</FAQQuestion>
          <FAQAnswer>
            Our ASL Translator uses advanced computer vision algorithms and deep learning 
            models that require direct access to your camera and processing power that is 
            best suited for a native application. This ensures the highest accuracy and 
            performance for your ASL translation needs.
          </FAQAnswer>
        </FAQItem>
        
        <FAQItem>
          <FAQQuestion>Is the ASL Translator free to use?</FAQQuestion>
          <FAQAnswer>
            Yes! The ASL Translator is completely free to download and use as part of the 
            SalInterpret project. We're committed to making sign language translation 
            technology accessible to everyone.
          </FAQAnswer>
        </FAQItem>
        
        <FAQItem>
          <FAQQuestion>Do I need an internet connection to use the translator?</FAQQuestion>
          <FAQAnswer>
            No, once installed, the ASL Translator works completely offline. All processing 
            happens on your device, which also means your data stays private.
          </FAQAnswer>
        </FAQItem>
        
        <FAQItem>
          <FAQQuestion>What sign language symbols are supported?</FAQQuestion>
          <FAQAnswer>
            Currently, the ASL Translator supports the American Sign Language alphabet (A-Z). 
            We're working on expanding the capabilities to include more signs and phrases in 
            future updates.
          </FAQAnswer>
        </FAQItem>
      </FAQSection>
    </Container>
  );
}

export default ASLTranslator;
