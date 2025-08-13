// Mock API for filings
function getStorageKey(userEmail) {
  return `filing_history_${userEmail}`;
}

function getHistory(userEmail) {
  const storageKey = getStorageKey(userEmail);
  return JSON.parse(localStorage.getItem(storageKey) || '[]');
}

function setHistory(history, userEmail) {
  const storageKey = getStorageKey(userEmail);
  localStorage.setItem(storageKey, JSON.stringify(history));
}

export async function uploadFiling(details, file, userEmail) {
  try {
    const id = Date.now().toString();
    
    // For PDF files, we'll store a placeholder content instead of trying to read binary data
    // In a real application, you'd upload to a server and store the file path
    const fileContent = `PDF_FILE_PLACEHOLDER_${file.name}_${file.size}`;
    
    const newEntry = {
      id,
      date: new Date().toISOString(),
      details,
      filename: file.name,
      status: 'Processing',
      fileContent: fileContent,
      userEmail: userEmail,
    };
    
    const history = getHistory(userEmail);
    setHistory([newEntry, ...history], userEmail);
    
    // Simulate processing delay
    setTimeout(() => {
      const updated = getHistory(userEmail).map(item =>
        item.id === id ? { ...item, status: 'Completed' } : item
      );
      setHistory(updated, userEmail);
    }, 3000);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Upload filing error:', error);
    throw error;
  }
}

export async function fetchFilingHistory(userEmail) {
  return getHistory(userEmail);
}

export async function downloadFile(id, userEmail) {
  const item = getHistory(userEmail).find(i => i.id === id);
  if (!item || item.status !== 'Completed') return;
  
  // Create a simple text file for demo purposes since we're not storing actual PDF content
  const content = `This is a placeholder for the file: ${item.filename}\n\nFile Details:\n- ID: ${item.id}\n- Upload Date: ${item.date}\n- Company: ${item.details.companyName}\n- Mandate: ${item.details.mandate}\n- Status: ${item.status}`;
  
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = item.filename.replace('.pdf', '_details.txt');
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// Function to clear user data (for logout)
export function clearUserData(userEmail) {
  const storageKey = getStorageKey(userEmail);
  localStorage.removeItem(storageKey);
}