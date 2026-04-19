using LinearAlgebra

mutable struct Kalman1D
    x::Float64
    P::Float64
    Q::Float64
    R::Float64
end

function init_kalman(initial_val::Float64; Q=0.1, R=1.0)
    return Kalman1D(initial_val, 1.0, Q, R)
end

function update_1d!(kf::Kalman1D, measurement::Float64)
    kf.P = kf.P + kf.Q
    K = kf.P / (kf.P + kf.R)
    kf.x = kf.x + K * (measurement - kf.x)
    kf.P = (1.0 - K) * kf.P
    return kf.x
end

mutable struct DeviceFilters
    light::Kalman1D
    temp::Kalman1D
    humidity::Kalman1D
    dist::Kalman1D
    pressure::Kalman1D
end

function init_device(data)
    return DeviceFilters(
        init_kalman(Float64(get(data, "light", 0.0)); Q=0.05, R=2.0),
        init_kalman(Float64(get(data, "temp", 0.0)); Q=0.01, R=0.5),
        init_kalman(Float64(get(data, "humidity", 0.0)); Q=0.02, R=1.0),
        init_kalman(Float64(get(data, "dist", 0.0)); Q=0.1, R=3.0),
        init_kalman(Float64(get(data, "pressure", 0.0)); Q=0.01, R=0.2)
    )
end
