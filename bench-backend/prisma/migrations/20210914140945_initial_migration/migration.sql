-- CreateTable
CREATE TABLE "Bench" (
    "name" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "ip" TEXT,
    "stid" TEXT,
    "build" TEXT,
    "svVer" TEXT,
    "voiceControl" BOOLEAN,
    "gsimCredId" INTEGER,

    CONSTRAINT "Benches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GsimCredential" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "GsimCreds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "name" TEXT NOT NULL,
    "color" TEXT,
    "id" SERIAL NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fki_gsimConstraint" ON "Bench"("gsimCredId");

-- AddForeignKey
ALTER TABLE "Bench" ADD CONSTRAINT "gsimConstraint" FOREIGN KEY ("gsimCredId") REFERENCES "GsimCredential"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
