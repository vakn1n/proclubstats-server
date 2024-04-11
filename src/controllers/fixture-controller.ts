import { NextFunction, Request, Response } from "express";
import FixtureService from "../services/fixture-service";

export default class FixtureController {
  private fixtureService: FixtureService;
  private static instance: FixtureController;

  private constructor() {
    this.fixtureService = FixtureService.getInstance();
  }

  static getInstance(): FixtureController {
    if (!this.instance) {
      this.instance = new FixtureController();
    }
    return this.instance;
  }
}
