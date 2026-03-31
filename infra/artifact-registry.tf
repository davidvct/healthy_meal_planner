resource "google_artifact_registry_repository" "cloud_run_source_deploy" {
  description   = "Cloud Run Source Deployments"
  format        = "DOCKER"
  location      = var.region
  mode          = "STANDARD_REPOSITORY"
  project       = var.project_id
  repository_id = "cloud-run-source-deploy"
}

resource "google_artifact_registry_repository" "meal_planner" {
  description   = "Meal Planner images"
  format        = "DOCKER"
  location      = var.region
  mode          = "STANDARD_REPOSITORY"
  project       = var.project_id
  repository_id = "meal-planner"
}
