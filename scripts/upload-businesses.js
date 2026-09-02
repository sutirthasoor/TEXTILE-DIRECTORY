const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, writeBatch } = require('firebase/firestore');
const { parse } = require('csv-parse/sync');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get CSV file from command line argument or use default
const csvFileName = process.argv[2] || 'Indian_Textiles_Directory_Cleaned.csv';
const csvFilePath = path.join(__dirname, '../data', csvFileName);

if (!fs.existsSync(csvFilePath)) {
  console.error(`❌ File not found at: ${csvFilePath}`);
  console.log(`📁 Usage: node scripts/upload-businesses.js [filename.csv]`);
  console.log(`📁 Example: node scripts/upload-businesses.js Indian_Textiles_Directory_Cleaned.csv`);
  process.exit(1);
}

console.log(`📊 Reading file: ${csvFileName}`);
const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

const records = parse(fileContent, { 
  columns: true, 
  skip_empty_lines: true, 
  trim: true,
  relax_quotes: true,
});

console.log(`📊 Found ${records.length} businesses to upload`);

const BATCH_SIZE = 500;
let uploadedCount = 0;
let skippedCount = 0;

function cleanText(text) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

function cleanPhone(phone) {
  if (!phone) return 'Not available';
  // Remove 'NA' or empty values
  if (phone === 'NA' || phone === 'N/A' || phone === '') return 'Not available';
  return cleanText(phone);
}

function cleanEmail(email) {
  if (!email) return 'Not available';
  if (email === 'NA' || email === 'N/A' || email === '') return 'Not available';
  return cleanText(email);
}

function cleanWebsite(website) {
  if (!website) return '';
  if (website === 'NA' || website === 'N/A' || website === '') return '';
  // Add https:// if missing
  let clean = cleanText(website);
  if (clean && !clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = 'https://' + clean;
  }
  return clean;
}

function getField(record, fieldName) {
  const value = record[fieldName] || record[fieldName.toLowerCase()] || '';
  return value;
}

async function uploadBatch(batchData) {
  const batch = writeBatch(db);
  
  for (const record of batchData) {
    // Get company name - try different possible column names
    const companyName = getField(record, 'Company / Organization') || 
                       getField(record, 'Company/Organization') || 
                       getField(record, 'Company') ||
                       getField(record, 'Organization');
    
    if (!companyName || companyName.trim() === '') {
      skippedCount++;
      continue;
    }

    // Get section/category
    const section = getField(record, 'Section') || 'Textile';

    // Get contact person
    const contactPerson = getField(record, 'Contact Person(s) & Designation') || 
                         getField(record, 'Contact Person(s) and Designation') || 
                         getField(record, 'Contact Person');

    // Get address
    const address = getField(record, 'Address') || 'Not available';

    // Get state
    const state = getField(record, 'State') || '';

    // Get city
    const city = getField(record, 'City') || '';

    // Get phone
    const phone = cleanPhone(getField(record, 'Phone'));

    // Get email
    const email = cleanEmail(getField(record, 'Email'));

    // Get website
    const website = cleanWebsite(getField(record, 'Website'));

    // Get product range
    const productRange = getField(record, 'Product Range / Capacity / Turnover') || 
                        getField(record, 'Product Range') || 'Not specified';

    const docRef = doc(collection(db, 'businesses'));
    batch.set(docRef, {
      name: cleanText(companyName),
      contactPerson: cleanText(contactPerson) || 'Not specified',
      phone: phone,
      email: email,
      website: website,
      address: cleanText(address),
      city: cleanText(city),
      state: cleanText(state),
      productRange: cleanText(productRange),
      category: cleanText(section),
      rating: 0,
      reviewCount: 0,
      images: [],
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  
  await batch.commit();
  uploadedCount += batchData.length;
  console.log(`✅ Uploaded ${uploadedCount}/${records.length} businesses (${skippedCount} skipped)`);
}

async function uploadAll() {
  try {
    console.log('🚀 Starting upload...');
    console.log(`📊 Total records: ${records.length}`);
    
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, Math.min(i + BATCH_SIZE, records.length));
      await uploadBatch(batch);
    }
    
    console.log(`\n🎉 Successfully uploaded ${uploadedCount} businesses!`);
    console.log(`⏭️ Skipped ${skippedCount} invalid entries`);
    console.log(`📊 Total businesses in Firebase: ${uploadedCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('❌ Error details:', error);
  }
}

uploadAll();