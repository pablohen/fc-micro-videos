import { config as readEnv } from "dotenv";
import { join } from "path";
import { Dialect } from "sequelize";

export type Config = {
  db: {
    vendor: Dialect;
    host: string;
    logging: boolean;
  };
};

function makeConfig(envFile): Config {
  const output = readEnv({
    path: envFile,
  });

  return {
    db: {
      vendor: output.parsed.DB_VENDOR as Dialect,
      host: output.parsed.DB_HOST,
      logging: output.parsed.DB_LOGGING === "true",
    },
  };
}

const envTestingFile = join(__dirname, "../../../../.env.testing");

export const configTest = makeConfig(envTestingFile);
