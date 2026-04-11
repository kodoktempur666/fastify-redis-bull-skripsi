import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import checkoutService from "./services/checkout.service.js";

const packageDef = protoLoader.loadSync(
  "proto/checkout.proto"
);

const proto = grpc.loadPackageDefinition(packageDef).checkout;

const server = new grpc.Server();

server.addService(
  proto.CheckoutService.service,
  checkoutService
);

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {

    console.log("gRPC running on 50051");

  }
);
