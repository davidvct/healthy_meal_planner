resource "google_storage_bucket" "mealvitals_infra" {
  name                        = "mealvitals-infra"
  location                    = "ASIA-SOUTHEAST1"
  project                     = var.project_id
  storage_class               = "STANDARD"
  public_access_prevention    = "enforced"
  uniform_bucket_level_access = true
  force_destroy               = false

  versioning {
    enabled = true
  }

  soft_delete_policy {
    retention_duration_seconds = 604800
  }
}