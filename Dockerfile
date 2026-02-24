FROM python:3.13-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /code/

COPY pyproject.toml uv.lock /code/

RUN uv sync --frozen --no-cache --no-dev

COPY ./example/ /code/example/
COPY ./example/app.py /code/app.py

CMD ["uv", "run", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "80"]

