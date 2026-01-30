#!/bin/bash
# =============================================================================
# EdApp GCS Bucket Setup Script
# Run this ONCE to create the GCS bucket and configure permissions
# Requires: gcloud CLI authenticated with sufficient permissions
# =============================================================================

set -e

# Configuration
PROJECT_ID="edapp-prod"
BUCKET_NAME="edapp-uploads"
REGION="africa-south1"
ZONE="africa-south1-b"
VM_NAME="edapp-api-vm"

echo "=============================================="
echo "EdApp GCS Bucket Setup"
echo "=============================================="
echo ""

# =============================================================================
# Step 1: Create the GCS bucket
# =============================================================================
echo "Creating GCS bucket: gs://${BUCKET_NAME}"

gcloud storage buckets create gs://${BUCKET_NAME} \
    --project=${PROJECT_ID} \
    --location=${REGION} \
    --uniform-bucket-level-access \
    --public-access-prevention

echo "Bucket created successfully"
echo ""

# =============================================================================
# Step 2: Get the VM's service account email
# =============================================================================
echo "Getting VM service account..."

SA_EMAIL=$(gcloud compute instances describe ${VM_NAME} \
    --project=${PROJECT_ID} \
    --zone=${ZONE} \
    --format='get(serviceAccounts[0].email)')

echo "VM Service Account: ${SA_EMAIL}"
echo ""

# =============================================================================
# Step 3: Grant Storage Object Admin permissions to the VM SA
# =============================================================================
echo "Granting Storage Object Admin role to VM service account..."

gcloud storage buckets add-iam-policy-binding gs://${BUCKET_NAME} \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/storage.objectAdmin"

echo "IAM binding created successfully"
echo ""

# =============================================================================
# Step 4: Verify the setup
# =============================================================================
echo "Verifying bucket configuration..."

gcloud storage buckets describe gs://${BUCKET_NAME} --format="yaml(name,location,publicAccessPrevention,iamConfiguration.uniformBucketLevelAccess)"

echo ""
echo "=============================================="
echo "GCS Bucket Setup Complete!"
echo "=============================================="
echo ""
echo "Bucket: gs://${BUCKET_NAME}"
echo "Region: ${REGION}"
echo "Service Account: ${SA_EMAIL}"
echo ""
echo "The VM can now access GCS using Application Default Credentials (ADC)."
echo "No JSON key file is required."
echo ""
