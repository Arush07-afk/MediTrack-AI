Set-Location $PSScriptRoot
if (-not (Test-Path ".venv\Scripts\python.exe")) {
  Write-Error "Missing .venv. Run: python -m venv .venv; .venv\Scripts\pip install -r requirements.txt; .venv\Scripts\python train.py"
  exit 1
}
& .\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
