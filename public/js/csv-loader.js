// Function to fetch and parse the CSV file
async function loadTipsFromCSV() {
  try {
    const response = await fetch('/data/Cursor.csv');
    if (!response.ok) {
      throw new Error('Failed to fetch CSV file');
    }
    
    const csvText = await response.text();
    
    // Parse CSV data
    const parsedData = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });

    console.log("CSV parsed successfully:", parsedData);

    // Transform CSV data to tips format
    const tips = parsedData.data.map((row, index) => {
      // Extract category tags from filter columns
      const categories = [];
      if (row.filter1) categories.push(...row.filter1.split(';'));
      if (row.filter2) categories.push(...row.filter2.split(';'));
      if (row.filter3) categories.push(...row.filter3.split(';'));
      
      // Clean up categories
      const uniqueCategories = [...new Set(categories.map(cat => cat.trim()))];
      
      return {
        id: index + 1,
        title: row.title || 'No Title',
        description: row.subtitle || (row.text ? row.text.substring(0, 120) + '...' : 'No description'),
        content: row.text || 'No content available',
        url: row.url || '#',
        images: row.images || '',
        thumbnail: row.thumbnail || '',
        categories: uniqueCategories,
        status: row.status || '',
        upvotes: parseInt(row.status || '0', 10) || Math.floor(Math.random() * 100),
        downvotes: Math.floor(Math.random() * 10)
      };
    });
    
    console.log("Tips data prepared:", tips);
    return tips;
  } catch (error) {
    console.error('Error loading CSV:', error);
    throw error; // Re-throw to handle in fetchTips
  }
}