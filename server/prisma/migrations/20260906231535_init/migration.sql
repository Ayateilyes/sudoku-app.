-- CreateTable
CREATE TABLE "puzzles" (
    "id" SERIAL NOT NULL,
    "difficulty" TEXT NOT NULL,
    "puzzle_data" JSONB NOT NULL,
    "solution_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "puzzles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_challenge" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "puzzle_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streaks" (
    "id" SERIAL NOT NULL,
    "nickname" TEXT NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "last_played" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "streaks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_challenge_date_key" ON "daily_challenge"("date");

-- CreateIndex
CREATE UNIQUE INDEX "streaks_nickname_key" ON "streaks"("nickname");

-- AddForeignKey
ALTER TABLE "daily_challenge" ADD CONSTRAINT "daily_challenge_puzzle_id_fkey" FOREIGN KEY ("puzzle_id") REFERENCES "puzzles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
