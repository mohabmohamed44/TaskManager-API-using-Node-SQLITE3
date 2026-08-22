const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Storage bucket name - can be overridden via environment variable
const STORAGE_BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || "Images";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

if (!supabaseServiceKey) {
  console.warn("⚠️  SUPABASE_SERVICE_ROLE_KEY is not set! Database queries will be subject to RLS policies and may fail.");
  console.warn("   Get it from: Supabase Dashboard → Settings → API → service_role key");
}

// Main database client — uses service role key to bypass RLS
// The backend handles its own authentication via JWT, so RLS is not needed here
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Create a separate client for storage operations using service role key (bypasses RLS)
const supabaseStorage = createClient(supabaseUrl, supabaseServiceKey || supabaseKey, {
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