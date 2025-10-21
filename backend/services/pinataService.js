const axios = require('axios');
const FormData = require('form-data');

class PinataService {
  constructor() {
    this.pinataApiKey = process.env.PINATA_API_KEY;
    this.pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
    this.pinataJWT = process.env.PINATA_JWT;
    this.baseURL = 'https://api.pinata.cloud';
  }

  // Test Pinata connection
  async testAuthentication() {
    try {
      console.log('🔍 Testing Pinata authentication...');
      
      const response = await axios.get(`${this.baseURL}/data/testAuthentication`, {
        headers: {
          'Authorization': `Bearer ${this.pinataJWT}`
        }
      });

      console.log('✅ Pinata authentication successful:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Pinata authentication failed:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  // Upload file to IPFS via Pinata
  async uploadFile(fileBuffer, fileName, metadata = {}) {
    try {
      console.log(`📤 Uploading file to IPFS: ${fileName}`);
      
      const formData = new FormData();
      formData.append('file', fileBuffer, fileName);
      
      // Add metadata
      const pinataMetadata = JSON.stringify({
        name: metadata.name || fileName,
        keyvalues: {
          originalName: fileName,
          uploadedBy: metadata.uploadedBy || 'system',
          category: metadata.category || 'auction-image',
          auctionId: metadata.auctionId || null,
          timestamp: new Date().toISOString(),
          ...metadata.customData
        }
      });
      formData.append('pinataMetadata', pinataMetadata);

      // Add options
      const pinataOptions = JSON.stringify({
        cidVersion: 0
      });
      formData.append('pinataOptions', pinataOptions);

      const response = await axios.post(
        `${this.baseURL}/pinning/pinFileToIPFS`,
        formData,
        {
          maxBodyLength: 'Infinity',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            'Authorization': `Bearer ${this.pinataJWT}`
          }
        }
      );

      console.log('✅ File uploaded to IPFS:', response.data);
      
      return {
        success: true,
        data: {
          ipfsHash: response.data.IpfsHash,
          pinSize: response.data.PinSize,
          timestamp: response.data.Timestamp,
          url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
          fileName: fileName,
          metadata: metadata
        }
      };
    } catch (error) {
      console.error('❌ File upload to IPFS failed:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message 
      };
    }
  }

  // Upload JSON data to IPFS
  async uploadJSON(jsonData, name, metadata = {}) {
    try {
      console.log(`📤 Uploading JSON to IPFS: ${name}`);
      
      const data = JSON.stringify({
        pinataContent: jsonData,
        pinataMetadata: {
          name: name,
          keyvalues: {
            type: 'json',
            uploadedBy: metadata.uploadedBy || 'system',
            timestamp: new Date().toISOString(),
            ...metadata.customData
          }
        },
        pinataOptions: {
          cidVersion: 0
        }
      });

      const response = await axios.post(
        `${this.baseURL}/pinning/pinJSONToIPFS`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.pinataJWT}`
          }
        }
      );

      console.log('✅ JSON uploaded to IPFS:', response.data);
      
      return {
        success: true,
        data: {
          ipfsHash: response.data.IpfsHash,
          pinSize: response.data.PinSize,
          timestamp: response.data.Timestamp,
          url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
          name: name,
          content: jsonData
        }
      };
    } catch (error) {
      console.error('❌ JSON upload to IPFS failed:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message 
      };
    }
  }

  // Get file from IPFS
  async getFile(ipfsHash) {
    try {
      console.log(`📥 Retrieving file from IPFS: ${ipfsHash}`);
      
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      
      return {
        success: true,
        data: response.data,
        url: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
      };
    } catch (error) {
      console.error('❌ Failed to retrieve file from IPFS:', error.message);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // List pinned files
  async listPinnedFiles(limit = 10, offset = 0, metadata = {}) {
    try {
      console.log('📋 Listing pinned files...');
      
      const params = {
        pageLimit: limit,
        pageOffset: offset,
        status: 'pinned'
      };

      // Add metadata filters if provided
      if (metadata.auctionId) {
        params['metadata[keyvalues][auctionId]'] = metadata.auctionId;
      }
      if (metadata.category) {
        params['metadata[keyvalues][category]'] = metadata.category;
      }

      const response = await axios.get(`${this.baseURL}/data/pinList`, {
        headers: {
          'Authorization': `Bearer ${this.pinataJWT}`
        },
        params: params
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Failed to list pinned files:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Unpin file from IPFS
  async unpinFile(ipfsHash) {
    try {
      console.log(`🗑️ Unpinning file from IPFS: ${ipfsHash}`);
      
      const response = await axios.delete(`${this.baseURL}/pinning/unpin/${ipfsHash}`, {
        headers: {
          'Authorization': `Bearer ${this.pinataJWT}`
        }
      });

      console.log('✅ File unpinned successfully');
      
      return {
        success: true,
        message: 'File unpinned successfully'
      };
    } catch (error) {
      console.error('❌ Failed to unpin file:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Update file metadata
  async updateFileMetadata(ipfsHash, newMetadata) {
    try {
      console.log(`📝 Updating metadata for: ${ipfsHash}`);
      
      const data = {
        ipfsPinHash: ipfsHash,
        name: newMetadata.name,
        keyvalues: {
          ...newMetadata.keyvalues,
          lastUpdated: new Date().toISOString()
        }
      };

      const response = await axios.put(`${this.baseURL}/pinning/hashMetadata`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.pinataJWT}`
        }
      });

      console.log('✅ Metadata updated successfully');
      
      return {
        success: true,
        message: 'Metadata updated successfully'
      };
    } catch (error) {
      console.error('❌ Failed to update metadata:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Generate auction metadata for NFT-style storage
  async createAuctionMetadata(auctionData) {
    try {
      const metadata = {
        name: auctionData.title,
        description: auctionData.description,
        image: auctionData.imageHash ? `https://gateway.pinata.cloud/ipfs/${auctionData.imageHash}` : null,
        attributes: [
          {
            trait_type: "Auction ID",
            value: auctionData.auctionId
          },
          {
            trait_type: "Starting Price",
            value: `${auctionData.startingPrice} ETH`
          },
          {
            trait_type: "Seller",
            value: auctionData.sellerAddress
          },
          {
            trait_type: "Duration",
            value: `${auctionData.duration} seconds`
          },
          {
            trait_type: "Created At",
            value: new Date().toISOString()
          }
        ],
        external_url: `${process.env.FRONTEND_URL}/auction/${auctionData.auctionId}`,
        animation_url: null,
        background_color: "1a365d"
      };

      const result = await this.uploadJSON(
        metadata, 
        `auction-${auctionData.auctionId}-metadata`,
        {
          uploadedBy: auctionData.sellerAddress,
          customData: {
            type: 'auction-metadata',
            auctionId: auctionData.auctionId
          }
        }
      );

      return result;
    } catch (error) {
      console.error('❌ Failed to create auction metadata:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}

module.exports = new PinataService();