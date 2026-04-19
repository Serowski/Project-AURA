using MQTTClient
using JSON3

function on_msg(channel::Channel)
    return function (topic, payload)
        payload_str = String(payload)
        try
            data = JSON3.read(payload_str, Dict{String, Any})
            
            if haskey(data, "data") && haskey(data, "device")
                put!(channel, data)
            else
                println("SKIP: JSON missing required keys: $payload_str")
            end
        catch e
            println("SKIP: Received non-JSON or invalid format: $payload_str")
        end
    end
end

function mqttconnect(broker::String, user::String="", pass::String="", port::Int=1883)
    client = MQTTClient.Client()
    client_id = "julia_filter_" * string(rand(UInt16))
    
    if user != "" && pass != ""
        _, connection = MakeConnection(broker, port; client_id=client_id, user=User(user, pass))
        MQTTClient.connect(client, connection)
    else
        _, connection = MakeConnection(broker, port; client_id=client_id)
        MQTTClient.connect(client, connection)
    end
    
    println("DEBUG connected to MQTT $broker:$port as $client_id")
    return client
end

function listen(client, channel::Channel, topic::String)
    try
        MQTTClient.subscribe(client, topic, on_msg(channel); qos=QOS_1)
        println("DEBUG subscribed to '$topic'")
        while true
            sleep(10)
        end
    catch e
        println("ERROR in listen task: $e")
    end
end

function publish_filtered(client, topic::String, payload_dict::Dict)
    json_str = JSON3.write(payload_dict)
    MQTTClient.publish(client, topic, json_str; qos=QOS_1)
end
