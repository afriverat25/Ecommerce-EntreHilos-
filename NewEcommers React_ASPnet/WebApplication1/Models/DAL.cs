using System.Data;
using System.Data.SqlClient;

namespace WebApplication1.Models
{
    public class DAL
    {
        // DAL.cs

        public Response registre(Users user, SqlConnection connection)
        {
            Response response = new Response();

            // 🔑 CAMBIO 1: La consulta ahora es el INSERT INTO directo.
            // Usamos los nombres de columna exactos: FirstName, fund (minúscula), etc.
            string sql = @"
                        INSERT INTO [dbo].[Users] 
                        (
                            FirstName, LastName, Password, Email, fund, Type, Status, CreatedOn
                        )
                        VALUES
                        (
                            @FirstName, @LastName, @Password, @Email, @Fund, @Type, @Status, @CreatedOn
                        )";

            // El SqlCommand usa la consulta SQL en línea
            SqlCommand command = new SqlCommand(sql, connection);

            // 🔑 CAMBIO 2: Cambiamos el CommandType a Text
            command.CommandType = System.Data.CommandType.Text;

            // Mantenemos los parámetros (es la parte segura, ¡fundamental!)
            command.Parameters.AddWithValue("@FirstName", user.Name);    // Mapea user.Name a @FirstName
            command.Parameters.AddWithValue("@LastName", user.LastName);
            command.Parameters.AddWithValue("@Password", user.Password);
            command.Parameters.AddWithValue("@Email", user.Email);
            command.Parameters.AddWithValue("@Fund", user.Fund);         // user.Fund es 0
            command.Parameters.AddWithValue("@Type", user.Type);         // user.Type es "Pending"
            command.Parameters.AddWithValue("@Status", user.Status);     // user.Status es 1
            command.Parameters.AddWithValue("@CreatedOn", user.CreatedOn); // user.CreatedOn es DateTime.Now

            try
            {
                connection.Open();
                int i = command.ExecuteNonQuery();
                connection.Close();

                if (i > 0)
                {
                    response.StatusCode = 200;
                    response.StatusMessage = "User Registered Succesfulluy";
                }
                else
                {
                    response.StatusCode = 100;
                    response.StatusMessage = "User Registered Failed (0 rows affected)";
                }
            }
            catch (SqlException ex)
            {
                // Esto ayudará a atrapar errores de columna/tipo de datos.
                response.StatusCode = 500;
                response.StatusMessage = "SQL Error: " + ex.Message;
                connection.Close();
            }

            return response;
        }


        // DAL.cs

        public Response Login(Users user, SqlConnection connection)
        {
            // 🔑 CAMBIO CLAVE: Usamos la consulta SQL SELECT directamente
            string sql = @"
                            SELECT 
                                ID, FirstName, LastName, Email, Type 
                            FROM [dbo].[Users] 
                            WHERE Email = @Email AND Password = @Password";

            // 💡 Usamos el constructor que acepta la consulta SQL
            SqlDataAdapter da = new SqlDataAdapter(sql, connection);

            // 🔑 CAMBIO CLAVE: Indicamos que el comando es texto (no un Stored Procedure)
            da.SelectCommand.CommandType = System.Data.CommandType.Text;

            // Los parámetros son la clave de la seguridad (previenen inyección SQL)
            da.SelectCommand.Parameters.AddWithValue("@Email", user.Email);
            da.SelectCommand.Parameters.AddWithValue("@Password", user.Password);

            DataTable dt = new DataTable();

            try
            {
                // 💡 El da.Fill(dt) maneja la apertura y cierre de la conexión por nosotros
                da.Fill(dt);
            }
            catch (SqlException ex)
            {
                // Esto ayudará a atrapar errores de columna/tipo de datos.
                Response errorResponse = new Response();
                errorResponse.StatusCode = 500;
                errorResponse.StatusMessage = "SQL Error during Login: " + ex.Message;
                return errorResponse;
            }

            Response response = new Response();
            Users loginUser = new Users();

            if (dt.Rows.Count > 0)
            {
                // Mapeo de datos (incluyendo el crucial 'Type')
                loginUser.Id = Convert.ToInt32(dt.Rows[0]["ID"]);
                loginUser.Name = Convert.ToString(dt.Rows[0]["FirstName"]);
                loginUser.LastName = Convert.ToString(dt.Rows[0]["LastName"]);
                loginUser.Email = Convert.ToString(dt.Rows[0]["Email"]);
                loginUser.Type = Convert.ToString(dt.Rows[0]["Type"]); // 🔑 Aquí recuperamos el rol

                response.StatusCode = 200;
                response.StatusMessage = "Login Successful";
                response.User = loginUser;
            }
            else
            {
                response.StatusCode = 100;
                response.StatusMessage = "Invalid Credentials";
                response.User = null;
            }

            return response;
        }

        public Response ViewUser(Users user, SqlConnection connection)
        {
            SqlDataAdapter da = new SqlDataAdapter("p_viewUser", connection);
            da.SelectCommand.CommandType = CommandType.StoredProcedure;
            da.SelectCommand.Parameters.AddWithValue("@ID", user.Id);

            DataTable dt = new DataTable();

            da.Fill(dt);

            Response response = new Response();
            Users loginUser = new Users();

            if (dt.Rows.Count > 0)
            {
                loginUser.Id = Convert.ToInt32(dt.Rows[0]["ID"]);
                loginUser.Name = Convert.ToString(dt.Rows[0]["FirstName"]);
                loginUser.LastName = Convert.ToString(dt.Rows[0]["LastName"]);
                loginUser.Email = Convert.ToString(dt.Rows[0]["Email"]);
                loginUser.Type = Convert.ToString(dt.Rows[0]["Type"]);
                loginUser.Fund = Convert.ToDecimal(dt.Rows[0]["Fund"]);
                loginUser.Password = Convert.ToString(dt.Rows[0]["Password"]);
                loginUser.CreatedOn = Convert.ToDateTime(dt.Rows[0]["CreatedOn"]);



                response.StatusCode = 200;
                response.StatusMessage = "User exist";

            }
            else
            {
                response.StatusCode = 100;
                response.StatusMessage = "User not exist";
                response.User = loginUser;

            }

            return response ;
        }

        public Response updateProfile(Users user, SqlConnection connection)
        {
            Response response = new Response();

            SqlCommand command = new SqlCommand("sp_updateProfile", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@FirstName", user.Name);
            command.Parameters.AddWithValue("@LastName", user.LastName);
            command.Parameters.AddWithValue("@Password", user.Password);
            command.Parameters.AddWithValue("@Email", user.Email);

            connection.Open();
            int i = command.ExecuteNonQuery();
            connection.Close();


            if(i > 0)
            {
                response.StatusCode = 200;
                response.StatusMessage = "Record Update";
            }
            else
            {
                response.StatusCode = 100;
                response.StatusMessage = "Some error ocurred";
            }

            return response ;
        }

        public Response addToCar(Car carshop , SqlConnection connection )
        {
            Response response = new Response();  
            SqlCommand command = new SqlCommand("sp_AddToCar",connection);

            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@UserId", carshop.UserId);
            command.Parameters.AddWithValue("@UnitPrice", carshop.UnitePrice);
            command.Parameters.AddWithValue("@Discount", carshop.Discount);
            command.Parameters.AddWithValue("@Quantity", carshop.Quantity);
            command.Parameters.AddWithValue("@TotalPrice", carshop.TotalPrice);
            command.Parameters.AddWithValue("@ProductId", carshop.ProductId);

            connection.Open (); 
            int i = command.ExecuteNonQuery();  
            connection.Close();

            if(i > 0)
            {
                response.StatusCode = 200;
                response.StatusMessage = "Item Added succesfully";
            }
            else
            {
                response.StatusCode = 100;
                response.StatusMessage = "Some error ocurred";
            }

            return response;
        }


        public Response placeOrder(Users user, SqlConnection connection)
        {

            Response response = new Response();
            SqlCommand command = new SqlCommand("sp_PlaceOrder", connection);
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@ID",user.Id);

            connection.Open();
            int i = command.ExecuteNonQuery();  
            connection.Close ();

            if (i > 0)
            {
                response.StatusCode = 200;
                response.StatusMessage = "Orden Has been placed succesfully";
            }
            else
            {
                response.StatusCode = 100;
                response.StatusMessage = "Ordern in problem";
            }

            return response ;
        }


        public Response OrderList(Users user, SqlConnection connection)
        {

            Response response = new Response();
            List<Orders> listOrdes = new List<Orders> ();
            SqlDataAdapter da = new SqlDataAdapter("sp_OrderList", connection);
            da.SelectCommand.CommandType = CommandType.StoredProcedure;
            da.SelectCommand.Parameters.AddWithValue("@Type", user.Type);
            da.SelectCommand.Parameters.AddWithValue("@ID", user.Id);
            DataTable dt = new DataTable();
            da.Fill(dt);
            if(dt.Rows.Count > 0)
            {
                for(int i = 0; i < dt.Rows.Count; i++)
                {
                    Orders order = new Orders();
                    order.Id = Convert.ToInt32(dt.Rows[0]["ID"]);
                    order.OrderNo = Convert.ToString(dt.Rows[i]["OrderNo"]);
                    order.OrderTotal = Convert.ToDecimal(dt.Rows[i]["OrderTotal"]);
                    order.OrderStatus = Convert.ToString(dt.Rows[i]["OrderStatus"]);
                    listOrdes.Add(order);
                }

                if(listOrdes.Count > 0)
                {
                    response.StatusCode = 200;
                    response.StatusMessage = "Orden Details view";
                    response.ListOrders = listOrdes;
                }
                else
                {
                    response.StatusCode = 100;
                    response.StatusMessage = "Order are not available ";
                    response.ListOrders = null;

                }
            }
            else
            {
                response.StatusCode = 100;
                response.StatusMessage = "Order are not available ";
                response.ListOrders = null;
            }
         

            return response;
        }

        // DAL.cs

        // DAL.cs

        public Response addUpdateProduct(Products product, SqlConnection connection)
        {
            Response response = new Response();

            // Consulta SQL en línea con lógica T-SQL IF/ELSE
            string sql = @"
        IF @Id = 0
        BEGIN
            -- INSERTAR (Nuevo Producto)
            INSERT INTO [dbo].[Products] 
            (
                Name, UnitPrice, Discount, Stoke, ImgUrl, Status
                -- ❌ IMPORTANTE: Si la columna 'Type' no existe en tu tabla Products, 
                -- debes eliminarla de aquí y de los parámetros.
            )
            VALUES
            (
                @Name, @UnitPrice, @Discount, @Stoke, @ImgUrl, @Status
            );
        END
        ELSE
        BEGIN
            -- ACTUALIZAR (Producto Existente)
            UPDATE [dbo].[Products]
            SET
                Name = @Name,
                UnitPrice = @UnitPrice,
                Discount = @Discount,
                Stoke = @Stoke,
                ImgUrl = @ImgUrl,
                Status = @Status
            WHERE ID = @Id;
        END";

            SqlCommand command = new SqlCommand(sql, connection);
            command.CommandType = System.Data.CommandType.Text;

            // Parámetros
            command.Parameters.AddWithValue("@Id", product.Id);
            command.Parameters.AddWithValue("@Name", product.Name);
            command.Parameters.AddWithValue("@UnitPrice", product.UnitePrice);
            command.Parameters.AddWithValue("@Discount", product.Discount);
            command.Parameters.AddWithValue("@Stoke", product.Stoke);
            command.Parameters.AddWithValue("@ImgUrl", product.ImgUrl); // 🔑 Aquí se usa la URL
            command.Parameters.AddWithValue("@Status", product.Status);

            // ... (El resto del bloque try/catch/finally para ExecuteNonQuery) ...
            try
            {
                connection.Open();
                int i = command.ExecuteNonQuery();
                connection.Close();

                if (i > 0)
                {
                    response.StatusCode = 200;
                    response.StatusMessage = (product.Id == 0) ? "Product inserted successfully" : "Product updated successfully";
                }
                else
                {
                    response.StatusCode = 100;
                    response.StatusMessage = "Product did not save or no changes were detected. 0 rows affected.";
                }
            }
            catch (SqlException ex)
            {
                response.StatusCode = 500;
                response.StatusMessage = "SQL Error during Product Save: " + ex.Message;
            }
            return response;
        }

        public Response userList(SqlConnection connection)
        {
            Response response = new Response();
            List<Users> listUsers = new List<Users>();

            // Consulta SQL
            string sql = "SELECT ID, FirstName, LastName, Email, fund, Type, Status, CreatedOn FROM [dbo].[Users]";

            SqlCommand command = new SqlCommand(sql, connection);
            command.CommandType = System.Data.CommandType.Text;

            try
            {
                connection.Open();
                SqlDataReader reader = command.ExecuteReader();

                int rowCount = 0; // 🔑 DIAGNÓSTICO: Contador de filas

                // 🛑 PON AQUÍ UN BREAKPOINT (punto de interrupción)
                while (reader.Read())
                {
                    rowCount++; // Aumenta el contador por cada fila leída

                    // 🔑 SIMPLIFICACIÓN CRÍTICA: Mapear solo los campos más simples
                    Users userLogin = new Users();

                    // 1. ID y Nombres (lo más simple)
                    userLogin.Id = reader.GetInt32(reader.GetOrdinal("ID"));
                    userLogin.Name = reader["FirstName"].ToString();
                    userLogin.LastName = reader["LastName"].ToString();
                    userLogin.Email = reader["Email"].ToString();

                    // 2. Mapear fund y Status de forma segura
                    userLogin.Fund = reader.IsDBNull(reader.GetOrdinal("fund")) ? 0.00m : reader.GetDecimal(reader.GetOrdinal("fund"));
                    userLogin.Status = reader.IsDBNull(reader.GetOrdinal("Status")) ? 0 : reader.GetInt32(reader.GetOrdinal("Status"));

                    // 3. Dejar Type y CreatedOn con los valores más seguros o ignorarlos por ahora
                    // Si el error persiste, la falla está en Type o CreatedOn
                    userLogin.Type = reader.IsDBNull(reader.GetOrdinal("Type")) ? "Cliente" : reader["Type"].ToString();
                    userLogin.CreatedOn = reader.IsDBNull(reader.GetOrdinal("CreatedOn")) ? DateTime.MinValue : reader.GetDateTime(reader.GetOrdinal("CreatedOn"));

                    // Si el código se detiene, el fallo está en una de las líneas de arriba.

                    listUsers.Add(userLogin);
                }

                reader.Close();
                connection.Close();

                // 🔑 DIAGNÓSTICO: Revisa el valor de rowCount.
                if (listUsers.Count > 0)
                {
                    // ... (Éxito 200) ...
                    response.StatusCode = 200;
                    response.StatusMessage = $"Success. Rows read: {rowCount}"; // Mensaje de éxito con conteo
                    response.ListUsers = listUsers;
                }
                else
                {
                    // ... (Lista vacía 200) ...
                    response.StatusCode = 200;
                    response.StatusMessage = $"No users found in database. Rows read: {rowCount}"; // Mensaje de lista vacía con conteo
                    response.ListUsers = new List<Users>();
                }
            }
            catch (Exception ex)
            {
                // 🛑 PON AQUÍ UN SEGUNDO BREAKPOINT
                // ... (Tu bloque catch 500) ...
                response.StatusCode = 500;
                response.StatusMessage = "SQL Error while fetching users: " + ex.Message;
                response.ListUsers = null;
            }

            return response;
        }


        // DAL.cs

        public Response getAllProducts(SqlConnection connection)
        {
            Response response = new Response();
            List<Products> listProducts = new List<Products>();

            // Consulta SQL para seleccionar todos los campos
            // DAL.cs (Línea de la consulta)
            string sql = "SELECT ID, Name, UnitPrice, Discount, Stoke, ImgUrl, Status FROM [dbo].[Products]";
            SqlCommand command = new SqlCommand(sql, connection);
            command.CommandType = System.Data.CommandType.Text;

            try
            {
                connection.Open();
                SqlDataReader reader = command.ExecuteReader();

                while (reader.Read())
                {
                    Products product = new Products();
                    product.Id = Convert.ToInt32(reader["ID"]);
                    product.Name = reader["Name"].ToString();
                    product.UnitePrice = Convert.ToDecimal(reader["UnitPrice"]);
                    product.Discount = Convert.ToDecimal(reader["Discount"]);
                    product.Stoke = Convert.ToInt32(reader["Stoke"]);
                    product.ImgUrl = reader["ImgUrl"].ToString();
                    product.Status = Convert.ToInt32(reader["Status"]);
                    // Asegúrate de que este campo exista en tu tabla si lo usas

                    listProducts.Add(product);
                }
                reader.Close();
                connection.Close();

                response.StatusCode = 200;
                response.StatusMessage = "Products fetched successfully";
                response.ListProducts = listProducts; // 🔑 Asignar la lista a la propiedad de respuesta
            }
            catch (Exception ex)
            {
                response.StatusCode = 500;
                response.StatusMessage = "SQL Error while fetching products: " + ex.Message;
            }

            return response;
        }


        // DAL.cs - Añade este nuevo método
        public Response DeleteProduct(int id, SqlConnection connection)
        {
            Response response = new Response();
            string sql = "DELETE FROM [dbo].[Products] WHERE Id = @Id";

            SqlCommand command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Id", id);

            try
            {
                connection.Open();
                int rowsAffected = command.ExecuteNonQuery();
                connection.Close();

                if (rowsAffected > 0)
                {
                    response.StatusCode = 200;
                    response.StatusMessage = "Producto eliminado con éxito.";
                }
                else
                {
                    response.StatusCode = 404;
                    response.StatusMessage = "Producto no encontrado o ya eliminado.";
                }
            }
            catch (Exception ex)
            {
                response.StatusCode = 500;
                response.StatusMessage = "Error SQL al eliminar el producto: " + ex.Message;
            }
            return response;
        }


        // En tu clase DAL.cs

        public Response updateRole(SqlConnection connection, Users user, string newRole)
        {
            Response response = new Response();
            string sql = "UPDATE [dbo].[Users] SET [Type] = @Type WHERE [ID] = @ID";

            SqlCommand command = new SqlCommand(sql, connection);
            command.CommandType = System.Data.CommandType.Text;

            command.Parameters.AddWithValue("@Type", newRole); // El nuevo rol (ej: Admin, Cliente)
            command.Parameters.AddWithValue("@ID", user.Id);

            try
            {
                connection.Open();
                int rowsAffected = command.ExecuteNonQuery();
                connection.Close();

                if (rowsAffected > 0)
                {
                    response.StatusCode = 200;
                    response.StatusMessage = "Role updated successfully.";
                }
                else
                {
                    response.StatusCode = 100;
                    response.StatusMessage = "User not found or role is the same.";
                }
            }
            catch (Exception ex)
            {
                response.StatusCode = 500;
                response.StatusMessage = "Error SQL al cambiar Role: " + ex.Message;
            }
            return response;
        }


        // En tu clase DAL.cs

        public Response addFunds(SqlConnection connection, Users user, decimal amountToAdd)
        {
            Response response = new Response();
            // 🔑 CLAVE: Usamos 'fund = fund + @Amount' para SUMAR.
            string sql = "UPDATE [dbo].[Users] SET [fund] = [fund] + @Amount WHERE [ID] = @ID";

            SqlCommand command = new SqlCommand(sql, connection);
            command.CommandType = System.Data.CommandType.Text;

            command.Parameters.AddWithValue("@Amount", amountToAdd);
            command.Parameters.AddWithValue("@ID", user.Id);

            try
            {
                connection.Open();
                int rowsAffected = command.ExecuteNonQuery();
                connection.Close();

                if (rowsAffected > 0)
                {
                    response.StatusCode = 200;
                    response.StatusMessage = "Funds added successfully.";
                }
                else
                {
                    response.StatusCode = 100;
                    response.StatusMessage = "User not found.";
                }
            }
            catch (Exception ex)
            {
                response.StatusCode = 500;
                response.StatusMessage = "Error SQL al cambiar Fondos: " + ex.Message;
            }
            return response;
        }

        // En tu clase DAL.cs

        public Response deleteUser(SqlConnection connection, int userId)
        {
            Response response = new Response();
            string sql = "DELETE FROM [dbo].[Users] WHERE [ID] = @ID";

            SqlCommand command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@ID", userId);

            try
            {
                connection.Open();
                int rowsAffected = command.ExecuteNonQuery();
                connection.Close();

                if (rowsAffected > 0)
                {
                    response.StatusCode = 200;
                    response.StatusMessage = "User deleted successfully.";
                }
                else
                {
                    response.StatusCode = 100;
                    response.StatusMessage = "User not found.";
                }
            }
            catch (Exception ex)
            {
                response.StatusCode = 500;
                response.StatusMessage = "Error SQL al eliminar USUARIOS: " + ex.Message;
            }
            return response;
        }



        // En tu clase DAL.cs

        public Response createOrderFromCart(SqlConnection connection, OrderRequestDTO orderRequest)
        {
            Response response = new Response();
            SqlTransaction transaction = null;
            int orderId = 0;

            // 1. Calcular el Total final de la Orden (se mantiene igual)
            decimal orderTotal = 0;
            foreach (var item in orderRequest.CartItems)
            {
                // Precio final por unidad = Precio Unitario * (1 - (Descuento / 100))
                decimal finalPrice = item.UnityPrice * (1 - (item.Discount / 100));
                orderTotal += finalPrice * item.Quantity;

                // 🚨 PRE-VERIFICACIÓN DE STOCK: Aquí podrías verificar si el stock actual
                // es suficiente antes de empezar la transacción, para fallar rápido.
                // Por ahora, lo haremos dentro de la transacción para mantenerlo atómico.
            }

            try
            {
                connection.Open();
                transaction = connection.BeginTransaction();

                // --- A. VERIFICACIÓN DE FONDOS ---
                string fundsSql = "SELECT fund FROM Users WHERE ID = @UserId";
                SqlCommand fundsCmd = new SqlCommand(fundsSql, connection, transaction);
                fundsCmd.Parameters.AddWithValue("@UserId", orderRequest.UserId);

                object balanceResult = fundsCmd.ExecuteScalar();

                if (balanceResult == null)
                {
                    throw new Exception("Usuario no encontrado.");
                }

                decimal currentBalance = Convert.ToDecimal(balanceResult);

                if (currentBalance < orderTotal)
                {
                    // Falla aquí si no hay fondos suficientes
                    throw new Exception($"Fondos insuficientes. Saldo actual: {currentBalance:C}. Total de la orden: {orderTotal:C}");
                }

                // --- B. INSERCIÓN EN ORDERS ---
                string orderNumber = "ORD-" + DateTime.Now.Ticks.ToString();
                string orderSql = @"
            INSERT INTO Orders (UserId, OrderNo, OrderTotal, OrderStatus)
            VALUES (@UserId, @OrderNo, @OrderTotal, @OrderStatus);
            SELECT SCOPE_IDENTITY();";

                SqlCommand orderCmd = new SqlCommand(orderSql, connection, transaction);
                orderCmd.Parameters.AddWithValue("@UserId", orderRequest.UserId);
                orderCmd.Parameters.AddWithValue("@OrderNo", orderNumber);
                orderCmd.Parameters.AddWithValue("@OrderTotal", orderTotal);
                orderCmd.Parameters.AddWithValue("@OrderStatus", "Completada"); // Cambiamos a Completada si todo va bien

                orderId = Convert.ToInt32(orderCmd.ExecuteScalar());

                // --- C. INSERCIÓN EN ORDERITEMS y ACTUALIZACIÓN DE STOCK ---
                string itemSql = @"
            INSERT INTO OrderItems (OrderId, ProductId, UnityPrice, Discount, Quatity, TotalPrice)
            VALUES (@OrderId, @ProductId, @UnityPrice, @Discount, @Quatity, @TotalPrice)";

                string stockSql = @"
            UPDATE Products SET stoke = stoke - @Quantity WHERE ID = @ProductId AND stoke >= @Quantity";

                foreach (var item in orderRequest.CartItems)
                {
                    decimal finalPrice = item.UnityPrice * (1 - (item.Discount / 100));
                    decimal itemTotalPrice = finalPrice * item.Quantity;

                    // 1. Insertar el ítem de la orden
                    SqlCommand itemCmd = new SqlCommand(itemSql, connection, transaction);
                    itemCmd.Parameters.AddWithValue("@OrderId", orderId);
                    itemCmd.Parameters.AddWithValue("@ProductId", item.ProductId);
                    itemCmd.Parameters.AddWithValue("@UnityPrice", item.UnityPrice);
                    itemCmd.Parameters.AddWithValue("@Discount", item.Discount);
                    itemCmd.Parameters.AddWithValue("@Quatity", item.Quantity);
                    itemCmd.Parameters.AddWithValue("@TotalPrice", itemTotalPrice);
                    itemCmd.ExecuteNonQuery();

                    // 2. Reducir el Stock (¡CRÍTICO!)
                    SqlCommand stockCmd = new SqlCommand(stockSql, connection, transaction);
                    stockCmd.Parameters.AddWithValue("@Quantity", item.Quantity);
                    stockCmd.Parameters.AddWithValue("@ProductId", item.ProductId);

                    int rowsAffected = stockCmd.ExecuteNonQuery();

                    if (rowsAffected == 0)
                    {
                        // Si esto ocurre, significa que el stock cayó a cero o menos desde que el usuario lo agregó al carrito.
                        // Usamos un mensaje que indique un error de concurrencia.
                        throw new Exception($"Error de stock concurrente: No se pudo restar el stock para el producto ID {item.ProductId}.");
                    }
                }

                // --- D. ACTUALIZACIÓN DEL SALDO DEL USUARIO ---
                string updateBalanceSql = "UPDATE Users SET fund = fund - @OrderTotal WHERE ID = @UserId";
                SqlCommand updateBalanceCmd = new SqlCommand(updateBalanceSql, connection, transaction);
                updateBalanceCmd.Parameters.AddWithValue("@OrderTotal", orderTotal);
                updateBalanceCmd.Parameters.AddWithValue("@UserId", orderRequest.UserId);
                updateBalanceCmd.ExecuteNonQuery();

                // 4. Si todo lo anterior fue exitoso, confirmar la transacción.
                transaction.Commit();
                response.StatusCode = 200;
                response.StatusMessage = $"Orden creada con éxito. Número de Orden: {orderNumber}";
            }
            catch (Exception ex)
            {
                // 5. Si algo falla (fondos, stock, o inserción), deshacer todos los cambios.
                transaction?.Rollback();
                response.StatusCode = 500;
                response.StatusMessage = "Error en la transacción de orden: " + ex.Message;
            }
            finally
            {
                connection.Close();
            }
            return response;
        }


        // En tu clase DAL.cs
        public List<UserOrderDTO> GetOrdersByUserId(SqlConnection connection, int userId)
        {
            List<UserOrderDTO> orders = new List<UserOrderDTO>();

            // Consulta principal para obtener las cabeceras de las órdenes
            string orderHeaderSql = @"
                                    SELECT Id, OrderNo, OrderTotal, OrderStatus
                                    FROM Orders
                                    WHERE UserId = @UserId
                                    ORDER BY Id DESC"; // Mostrar las más recientes primero

            // Consulta para obtener el detalle de los ítems y el nombre del producto
            string orderItemsSql = @"
                                    SELECT 
                                        oi.Id, oi.ProductId, p.name AS ProductName, oi.UnityPrice, oi.Discount, oi.Quatity, oi.TotalPrice,
                                        p.imgUrl  -- 🔑 AÑADIMOS LA URL DE LA IMAGEN
                                    FROM OrderItems oi
                                    JOIN Products p ON oi.ProductId = p.ID
                                    WHERE oi.OrderId = @OrderId";

            try
            {
                connection.Open();

                // 1. Obtener todas las cabeceras de las órdenes del usuario
                SqlCommand headerCmd = new SqlCommand(orderHeaderSql, connection);
                headerCmd.Parameters.AddWithValue("@UserId", userId);

                using (SqlDataReader headerReader = headerCmd.ExecuteReader())
                {
                    while (headerReader.Read())
                    {
                        UserOrderDTO order = new UserOrderDTO
                        {
                            OrderId = headerReader.GetInt32(0),
                            OrderNo = headerReader.GetString(1),
                            OrderTotal = headerReader.GetDecimal(2),
                            OrderStatus = headerReader.GetString(3),
                            Items = new List<OrderItemDetailDTO>() // Inicializar la lista de ítems
                        };
                        orders.Add(order);
                    }
                }

                // 2. Obtener los ítems para CADA orden (requiere un nuevo reader/comando)
                // Cerramos la conexión y la volvemos a abrir si es necesario, 
                // pero es mejor usar el mismo objeto connection y reader separado.
                // Como el primer reader ya cerró la conexión implícitamente, continuamos.

                foreach (var order in orders)
                {
                    SqlCommand itemsCmd = new SqlCommand(orderItemsSql, connection);
                    itemsCmd.Parameters.AddWithValue("@OrderId", order.OrderId);

                    using (SqlDataReader itemsReader = itemsCmd.ExecuteReader())
                    {
                        while (itemsReader.Read())
                        {
                            OrderItemDetailDTO item = new OrderItemDetailDTO
                            {
                                OrderItemId = itemsReader.GetInt32(0),
                                ProductId = itemsReader.GetInt32(1),
                                ProductName = itemsReader.GetString(2),
                                UnityPrice = itemsReader.GetDecimal(3),
                                Discount = itemsReader.GetDecimal(4),
                                Quatity = itemsReader.GetInt32(5),
                                TotalPrice = itemsReader.GetDecimal(6),
                                ImgUrl = itemsReader.GetString(7) // 🔑 Leer la nueva columna (índice 7)
                            };
                            order.Items.Add(item);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // En caso de error, puedes registrar el error y devolver una lista vacía
                Console.WriteLine(ex.Message);
                return new List<UserOrderDTO>();
            }
            finally
            {
                if (connection.State == System.Data.ConnectionState.Open)
                {
                    connection.Close();
                }
            }

            return orders;
        }


        // En tu clase DAL.cs
        public List<UserOrderDTO> GetAllOrders(SqlConnection connection)
        {
            List<UserOrderDTO> orders = new List<UserOrderDTO>();

            // Consulta principal: JOIN con Users para obtener el nombre
            string orderHeaderSql = @"
                                    SELECT 
                                        o.Id, o.OrderNo, o.OrderTotal, o.OrderStatus, 
                                        u.FirstName AS UserName
                                    FROM Orders o
                                    JOIN Users u ON o.UserId = u.ID -- <--- ¿Es tu FK 'o.UserId'? ¿Es tu PK de Users 'u.ID'?
                                    ORDER BY o.Id DESC";

            // Consulta para obtener el detalle de los ítems (se mantiene igual, asumiendo que ya tienes Product.Name y Product.ImgUrl)
            string orderItemsSql = @"
                                    SELECT 
                                        oi.ID, oi.ProductId, p.Name AS ProductName, oi.UnityPrice, oi.Discount, oi.Quatity, oi.TotalPrice, p.ImgUrl
                                    FROM OrderItems oi
                                    JOIN Products p ON oi.ProductId = p.ID
                                    WHERE oi.OrderId = @OrderId";

            try
            {
                connection.Open();

                // 1. Obtener todas las cabeceras de las órdenes
                SqlCommand headerCmd = new SqlCommand(orderHeaderSql, connection);

                using (SqlDataReader headerReader = headerCmd.ExecuteReader())
                {
                    while (headerReader.Read())
                    {
                        UserOrderDTO order = new UserOrderDTO
                        {
                            OrderId = headerReader.GetInt32(0),
                            OrderNo = headerReader.GetString(1),
                            OrderTotal = headerReader.GetDecimal(2),
                            OrderStatus = headerReader.GetString(3),
                            UserName = headerReader.GetString(4), // 🔑 Leemos el nombre
                            Items = new List<OrderItemDetailDTO>()
                        };
                        orders.Add(order);
                    }
                }

                // 2. Obtener los ítems para CADA orden
                foreach (var order in orders)
                {
                    SqlCommand itemsCmd = new SqlCommand(orderItemsSql, connection);
                    itemsCmd.Parameters.AddWithValue("@OrderId", order.OrderId);

                    using (SqlDataReader itemsReader = itemsCmd.ExecuteReader())
                    {
                        // ... (La misma lógica de lectura de ítems que en GetOrdersByUserId)
                        while (itemsReader.Read())
                        {
                            OrderItemDetailDTO item = new OrderItemDetailDTO
                            {
                                // ... (Lectura de todas las columnas, incluyendo ImgUrl en el índice 7)
                                OrderItemId = itemsReader.GetInt32(0),
                                ProductId = itemsReader.GetInt32(1),
                                ProductName = itemsReader.GetString(2),
                                UnityPrice = itemsReader.GetDecimal(3),
                                Discount = itemsReader.GetDecimal(4),
                                Quatity = itemsReader.GetInt32(5),
                                TotalPrice = itemsReader.GetDecimal(6),
                                ImgUrl = itemsReader.GetString(7)
                            };
                            order.Items.Add(item);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return new List<UserOrderDTO>();
            }
            finally
            {
                if (connection.State == System.Data.ConnectionState.Open)
                {
                    connection.Close();
                }
            }

            return orders;
        }


        // En tu clase DAL.cs
        public Response UpdateOrderStatus(SqlConnection connection, int orderId, string newStatus)
        {
            Response response = new Response();
            string sql = "UPDATE Orders SET OrderStatus = @NewStatus WHERE Id = @OrderId";

            try
            {
                connection.Open();
                SqlCommand cmd = new SqlCommand(sql, connection);
                cmd.Parameters.AddWithValue("@NewStatus", newStatus);
                cmd.Parameters.AddWithValue("@OrderId", orderId);

                int rowsAffected = cmd.ExecuteNonQuery();

                if (rowsAffected > 0)
                {
                    response.StatusCode = 200;
                    response.StatusMessage = $"Estado de la orden {orderId} actualizado a '{newStatus}'.";
                }
                else
                {
                    response.StatusCode = 404;
                    response.StatusMessage = $"No se encontró la orden con ID {orderId}.";
                }
            }
            catch (Exception ex)
            {
                response.StatusCode = 500;
                response.StatusMessage = "Error al actualizar el estado: " + ex.Message;
            }
            finally
            {
                connection.Close();
            }
            return response;
        }


        // En tu clase DAL.cs
        public Response DeleteOrder(SqlConnection connection, int orderId)
        {
            Response response = new Response();
            SqlTransaction transaction = null;

            try
            {
                connection.Open();
                transaction = connection.BeginTransaction();

                // 1. Eliminar ítems de la orden
                string deleteItemsSql = "DELETE FROM OrderItems WHERE OrderId = @OrderId";
                SqlCommand deleteItemsCmd = new SqlCommand(deleteItemsSql, connection, transaction);
                deleteItemsCmd.Parameters.AddWithValue("@OrderId", orderId);
                deleteItemsCmd.ExecuteNonQuery();

                // 2. Eliminar la orden principal
                string deleteOrderSql = "DELETE FROM Orders WHERE Id = @OrderId";
                SqlCommand deleteOrderCmd = new SqlCommand(deleteOrderSql, connection, transaction);
                deleteOrderCmd.Parameters.AddWithValue("@OrderId", orderId);
                int rowsAffected = deleteOrderCmd.ExecuteNonQuery();

                if (rowsAffected > 0)
                {
                    transaction.Commit();
                    response.StatusCode = 200;
                    response.StatusMessage = $"Orden {orderId} y sus ítems eliminados con éxito.";
                }
                else
                {
                    transaction.Rollback();
                    response.StatusCode = 404;
                    response.StatusMessage = $"No se encontró la orden con ID {orderId}.";
                }
            }
            catch (Exception ex)
            {
                transaction?.Rollback();
                response.StatusCode = 500;
                response.StatusMessage = "Error al eliminar la orden: " + ex.Message;
            }
            finally
            {
                connection.Close();
            }
            return response;
        }


        // En tu UsersDAL.cs o DAL.cs
        public Users GetUserDetails(SqlConnection connection, int userId)
        {
            // User es la clase que mapea a tu tabla (debe tener las propiedades FirstName, LastName, Fund, Email)
            Users user = null;
            string sql = @"
        SELECT ID, FirstName, LastName, Fund, Email, Type, Status 
        FROM Users 
        WHERE ID = @UserId";

            try
            {
                connection.Open();
                SqlCommand cmd = new SqlCommand(sql, connection);
                cmd.Parameters.AddWithValue("@UserId", userId);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        user = new Users
                        {
                            Id = reader.GetInt32(0),
                            Name = reader.GetString(1),
                            LastName = reader.GetString(2),
                            Fund = reader.GetDecimal(3),
                            Email = reader.GetString(4),
                            Type = reader.GetString(5),
                            Status = reader.GetInt32(6)
                            // No leemos Password, CreatedOn
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error al obtener detalles: " + ex.Message);
            }
            finally
            {
                connection.Close();
            }
            return user;
        }

        // En tu UsersDAL.cs o DAL.cs
        public Response UpdateUser(SqlConnection connection, UserUpdateDTO request)
        {
            Response response = new Response();

            // Consulta SQL base para actualizar nombre y apellido
            string sql = "UPDATE Users SET FirstName = @FirstName, LastName = @LastName";

            // Si se proporcionó una nueva contraseña, la agregamos a la consulta
            if (!string.IsNullOrEmpty(request.NewPassword))
            {
                // ⚠️ Nota: En un proyecto real, aquí se hashea y se usa un salt
                sql += ", Password = @Password";
            }

            sql += " WHERE ID = @UserId"; // Condición final

            try
            {
                connection.Open();
                SqlCommand cmd = new SqlCommand(sql, connection);

                cmd.Parameters.AddWithValue("@FirstName", request.FirstName);
                cmd.Parameters.AddWithValue("@LastName", request.LastName);
                cmd.Parameters.AddWithValue("@UserId", request.UserId);

                if (!string.IsNullOrEmpty(request.NewPassword))
                {
                    cmd.Parameters.AddWithValue("@Password", request.NewPassword);
                }

                int rowsAffected = cmd.ExecuteNonQuery();

                // ... (Manejo de éxito/error igual que antes) ...
                if (rowsAffected > 0)
                {
                    response.StatusCode = 200;
                    response.StatusMessage = "Datos de perfil actualizados con éxito.";
                }
                else
                {
                    response.StatusCode = 404;
                    response.StatusMessage = "Usuario no encontrado o no hubo cambios.";
                }
            }catch (Exception ex)
            {
                response.StatusCode = 500;
                response.StatusMessage = "Usuario no encontrado o no hubo cambios.";
            }
            
            
            return response;
        }

    }
}
