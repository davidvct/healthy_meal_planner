terraform {
  backend "gcs" {
    bucket = "mealvitals-infra"
    prefix = "tofu/state"
  }
}
