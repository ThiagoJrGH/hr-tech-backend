BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Users] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(255) NOT NULL,
    [password_hash] NVARCHAR(255) NOT NULL,
    [role] NVARCHAR(20) NOT NULL CONSTRAINT [Users_role_df] DEFAULT 'HR',
    CONSTRAINT [Users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Employees] (
    [id] INT NOT NULL IDENTITY(1,1),
    [first_name] NVARCHAR(120) NOT NULL,
    [last_name] NVARCHAR(120) NOT NULL,
    [department] NVARCHAR(120) NOT NULL,
    [position] NVARCHAR(120) NOT NULL,
    [base_salary] DECIMAL(18,2) NOT NULL,
    [hire_date] DATE NOT NULL,
    [performance_rating] INT NOT NULL,
    CONSTRAINT [Employees_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Departments] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(120) NOT NULL,
    CONSTRAINT [Departments_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Departments_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[Positions] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(120) NOT NULL,
    [department_id] INT NOT NULL,
    CONSTRAINT [Positions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Positions] ADD CONSTRAINT [Positions_department_id_fkey] FOREIGN KEY ([department_id]) REFERENCES [dbo].[Departments]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
