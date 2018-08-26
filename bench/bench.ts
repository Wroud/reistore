import { runBenchmark, noopSuite } from "stmbenchmarks";
import { optionsDefault } from "stmbenchmarks/lib/options";
import { reduxSuite } from "./suites/redux";
import { reistoreSuite } from "./suites/reistore";
import { proxySuite } from "./suites/proxy";

runBenchmark([/*noopSuite, proxySuite,reduxSuite,*/ reistoreSuite], optionsDefault);