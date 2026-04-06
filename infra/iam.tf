resource "google_service_account" "github_deployer" {
  account_id   = "github-deployer"
  description  = "github deployer"
  display_name = "github-deployer"
  project      = var.project_id
}
