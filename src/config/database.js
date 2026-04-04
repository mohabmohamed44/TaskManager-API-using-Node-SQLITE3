const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_API_KEY || supabaseKey;

// Storage bucket name - can be overridden via environment variable
const STORAGE_BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || "Images";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    flowType: "pkce",
  },
});

// Create a separate client for storage operations using service role key (bypasses RLS)
const supabaseStorage = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper function to list buckets and verify bucket exists
async function verifyBucketExists(bucketName) {
  try {
    const { data: buckets, error } = await supabaseStorage.storage.listBuckets();
    if (error) {
      console.error("Error listing buckets:", error);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => 
      bucket.name === bucketName || 
      bucket.name.toLowerCase() === bucketName.toLowerCase()
    );
    
    if (!bucketExists && buckets && buckets.length > 0) {
      console.log("Available buckets:", buckets.map(b => b.name).join(", "));
    }
    
    return bucketExists;
  } catch (error) {
    console.error("Error verifying bucket:", error);
    return false;
  }
}

module.exports = supabase;
module.exports.supabaseStorage = supabaseStorage;
module.exports.STORAGE_BUCKET_NAME = STORAGE_BUCKET_NAME;
module.exports.verifyBucketExists = verifyBucketExists;