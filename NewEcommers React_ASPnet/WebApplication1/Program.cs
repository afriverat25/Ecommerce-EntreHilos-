var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// 🔑 ADICIÓN CLAVE: Registra el entorno del host (IWebHostEnvironment)
// Esto asegura que el constructor de tu ProductsController pueda ser resuelto correctamente.
builder.Services.AddSingleton<IWebHostEnvironment>(builder.Environment);
// Si la línea de arriba da problemas, intenta también:
// builder.Services.AddHttpContextAccessor(); 

// ✅ Habilitamos CORS para permitir llamadas desde React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

// Swagger (documentación de la API)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ✅ Activamos CORS antes de los controladores
app.UseCors("AllowReactApp");

// ✅ Esta ya está correcta
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

app.Run();
