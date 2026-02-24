FROM python:3.13-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /code/

COPY example/pyproject.toml example/uv.lock /code/

RUN uv sync --frozen --no-cache --no-dev

COPY ./example/example.py /code/example.py

CMD ["uv", "run", "uvicorn", "example:app", "--host", "0.0.0.0", "--port", "80"]

