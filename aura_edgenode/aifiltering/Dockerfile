FROM julia:1.10

WORKDIR /app

RUN julia -e 'using Pkg; Pkg.add(["MQTTClient", "JSON3"])'

COPY julia/ ./julia/

CMD ["julia", "julia/main.jl"]
