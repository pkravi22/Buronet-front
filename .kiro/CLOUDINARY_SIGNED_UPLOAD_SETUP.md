# Cloudinary Signed Upload Configuration

## Overview
Changed from unsigned to signed Cloudinary uploads for better security and control. Signed uploads require server-side signature generation, preventing unauthorized uploads.

## Files Modified

### 1. Frontend Changes
- **app/home/components/CreateBytePostModal.tsx** - Updated video upload to use signed uploads
- **app/home/components/CreatePostModal.tsx** - Updated image upload to use signed uploads

### 2. Backend Changes
- **app/api/cloudinary/get-signature/route.ts** - New endpoint that generates secure signatures server-side

## Environment Variables Required

Add these to `.env.local`:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=db65bnadc
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## Cloudinary Dashboard Configuration

### Step 1: Get Your Credentials
1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy your **API Key** and **API Secret**
3. Add them to `.env.local`

### Step 2: Configure Upload Preset
1. Go to **Settings** → **Upload** in Cloudinary dashboard
2. Scroll to **Upload presets** section
3. Click **Add upload preset** or edit existing one
4. Configure:
   - **Name**: `buronet` (or your preferred name)
   - **Signing Mode**: **Signed** ⚠️ (IMPORTANT - change from unsigned)
   - **Folder**: `buronet` (optional, for organization)
   - **Resource type**: Allow `Image` and `Video`
5. Save the preset

### Step 3: Verify Settings
- Ensure "Signing Mode" is set to **Signed** (not unsigned)
- This ensures only requests with valid signatures are accepted

## How It Works

### Upload Flow
1. Frontend requests signature from `/api/cloudinary/get-signature`
2. Backend generates signature using `CLOUDINARY_API_SECRET` (never exposed to frontend)
3. Frontend uploads file to Cloudinary with signature
4. Cloudinary validates signature and accepts/rejects upload

### Security Benefits
- API Secret never exposed to frontend
- Only authorized uploads accepted
- Server controls what can be uploaded
- Prevents unauthorized file uploads

## Testing

### Test Image Upload
1. Go to home page
2. Click "Create a Post"
3. Select an image
4. Submit - should upload to Cloudinary

### Test Video Upload
1. Go to Bytes section
2. Click "Upload a Byte"
3. Select a video file
4. Submit - should upload to Cloudinary

## Troubleshooting

### "Failed to get upload signature from server"
- Check `.env.local` has `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`
- Verify API endpoint is accessible

### "Failed to upload to Cloudinary"
- Verify Cloudinary credentials are correct
- Check upload preset is set to "Signed" mode
- Ensure file size is within limits

### "Signature validation failed"
- Verify `CLOUDINARY_API_SECRET` is correct
- Check timestamp is not too old (should be recent)

## Additional Notes

- Profile image uploads (`/Users/profile/upload_picture`) still use backend endpoint - can be updated separately if needed
- Public IDs are generated as: `buronet/{resourceType}/{timestamp}-{random}`
- Signatures are valid for a short time window (timestamp-based)
