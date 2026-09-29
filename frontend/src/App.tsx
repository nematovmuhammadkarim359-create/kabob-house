import { useEffect, useState } from "react";
import "./App.css";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string | null;
  is_available: boolean;
  category: Category;
  created_at: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const categories = [
  { name: "Kaboblar", icon: "🍢" },
  { name: "Grill", icon: "🔥" },
  { name: "Ichimliklar", icon: "🥤" },
  { name: "Salatlar", icon: "🥗" },
  { name: "Non", icon: "🫓" },
];

function formatPrice(price: string | number) {
  return Number(price).toLocaleString("uz-UZ");
}

function getProductIcon(categoryName: string) {
  switch (categoryName.toLowerCase()) {
    case "kaboblar":
      return "🍢";
    case "grill":
      return "🔥";
    case "ichimliklar":
      return "🥤";
    case "salatlar":
      return "🥗";
    case "non":
      return "🫓";
    default:
      return "🍽️";
  }
}

function getImageUrl(image: string | null) {
  if (!image) {
    return "";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `http://127.0.0.1:8000${image}`;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * SAVAT
   *
   * localStorage orqali saqlanadi.
   * Shuning uchun refresh qilinganda ham savat yo'qolmaydi.
   */
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem("kabob_house_cart");

      if (savedCart) {
        return JSON.parse(savedCart);
      }
    } catch (error) {
      console.error("Savatni o'qishda xato:", error);
    }

    return [];
  });

  const [cartOpen, setCartOpen] = useState(false);

  /*
   * BUYURTMA PANELI
   */
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  /*
   * SAVAT O'ZGARGANDA localStorage ga yozamiz
   */
  useEffect(() => {
    localStorage.setItem(
      "kabob_house_cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  /*
   * MAHSULOTLARNI DJANGO'DAN OLISH
   */
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Server xatosi");
        }

        return response.json();
      })
      .then((data: Product[]) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError(
          "Mahsulotlarni yuklashda xatolik yuz berdi."
        );
        setLoading(false);
      });
  }, []);

  /*
   * SAVATGA QO'SHISH
   */
  const addToCart = (product: Product) => {
    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.product.id === product.id
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          product,
          quantity: 1,
        },
      ];
    });

  };

  /*
   * SONINI OSHIRISH
   */
  const increaseQuantity = (productId: number) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  /*
   * SONINI KAMAYTIRISH
   */
  const decreaseQuantity = (productId: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  /*
   * MAHSULOTNI SAVATDAN O'CHIRISH
   */
  const removeFromCart = (productId: number) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.product.id !== productId
      )
    );
  };

  /*
   * SAVATNI TO'LIQ TOZALASH
   */
  const clearCart = () => {
    setCart([]);
  };

  /*
   * SAVATDAGI UMUMIY MAHSULOT SONI
   */
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  /*
   * UMUMIY NARX
   */
  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.product.price) * item.quantity,
    0
  );

  /*
   * BUYURTMA PANELINI OCHISH
   */
  const openCheckout = () => {
    if (cart.length === 0) {
      return;
    }

    setCartOpen(false);
    setCheckoutOpen(true);
  };

  /*
   * BUYURTMA
   *
   * Hozircha test.
   * Keyingi bosqichda Django API ga yuboramiz.
   */
  const submitOrder = (event: React.FormEvent) => {
    event.preventDefault();

    if (!customerName.trim()) {
      alert("Iltimos, ismingizni kiriting.");
      return;
    }

    if (!phone.trim()) {
      alert("Iltimos, telefon raqamingizni kiriting.");
      return;
    }

    if (!address.trim()) {
      alert("Iltimos, manzilingizni kiriting.");
      return;
    }

    alert(
      `Rahmat, ${customerName}!\n\nBuyurtmangiz qabul qilindi.\n\nJami: ${formatPrice(
        cartTotal
      )} so'm\n\nKeyingi bosqichda bu buyurtmani Django bazasiga saqlaymiz.`
    );

    /*
     * Hozircha test uchun savatni tozalaymiz.
     */
    clearCart();
    setCheckoutOpen(false);

    setCustomerName("");
    setPhone("");
    setAddress("");
  };

  return (
    <div className="app">

      {/* ================================================= */}
      {/* NAVBAR */}
      {/* ================================================= */}

      <header className="navbar">

        <div className="container nav-content">

          <a href="#home" className="logo">

            <img
              src="/kabob-logo-header.png"
              alt="Kabob House"
              style={{
                width: "190px",
                height: "auto",
                objectFit: "contain",
              }}
            />

          </a>

          <nav>

            <a href="#home">
              Bosh sahifa
            </a>

            <a href="#menu">
              Menyu
            </a>

            <a href="#delivery">
              Yetkazib berish
            </a>

          </nav>

    <button
      className="cart-button"
      onClick={() => {
        if (cart.length > 0) {
          setCheckoutOpen(true);
        } else {
          setCartOpen(true);
        }
      }}
    >

      🛒

      <span>
        Savat
      </span>

      <b>
        {cartCount}
      </b>

    </button>

        </div>

      </header>


      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <main>

        <section
          className="hero"
          id="home"
        >

          <div className="container hero-content">

            <div className="hero-text">

              <span className="hero-badge">
                🔥 YANGI TA'M
              </span>

              <h1>
                Haqiqiy kabob
                <br />
                <span>
                  haqiqiy lazzat.
                </span>
              </h1>

              <p>
                Yangi va sifatli mahsulotlardan
                tayyorlangan mazali kaboblar.
                Uchko‘prik tumani bo‘ylab
                tezkor yetkazib berish.
              </p>

              <div className="hero-buttons">

                <a
                  href="#menu"
                  className="primary-button"
                >
                  Menyuni ko‘rish →
                </a>

                <a
                  href="#delivery"
                  className="secondary-button"
                >
                  📍 Yetkazib berish
                </a>

              </div>

              <div className="hero-info">

                <div>
                  <strong>
                    100%
                  </strong>

                  <span>
                    Yangi mahsulot
                  </span>
                </div>

                <div>
                  <strong>
                    {products.length}+
                  </strong>

                  <span>
                    Menyu tanlovi
                  </span>
                </div>

                <div>
                  <strong>
                    ⚡
                  </strong>

                  <span>
                    Tez yetkazish
                  </span>
                </div>

              </div>

            </div>


            <div
              className="hero-food"
              style={{
                backgroundImage:
                  "url('/kabob-hero-fire.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                borderRadius: "30px",
                overflow: "hidden",
              }}
            >

              <div className="food-glow"></div>

            </div>

          </div>

        </section>
        <section className="categories">

          <div className="container">

            <div className="section-heading">

              <div>

                <span className="section-label">
                  MENYU
                </span>

                <h2>
                  O‘zingizga yoqqanini tanlang
                </h2>

              </div>

              <a href="#menu">
                Barchasini ko‘rish →
              </a>

            </div>


            <div className="category-grid">

              {categories.map((category) => (

                <button
                  className="category-card"
                  key={category.name}
                  onClick={() => {
                    const menu =
                      document.getElementById(
                        "menu"
                      );

                    menu?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                >

                  <span>
                    {category.icon}
                  </span>

                  <strong>
                    {category.name}
                  </strong>

                </button>

              ))}

            </div>

          </div>

        </section>


        {/* ================================================= */}
        {/* PRODUCTS */}
        {/* ================================================= */}

        <section
          className="products"
          id="menu"
        >

          <div className="container">

            <div className="section-heading">

              <div>

                <span className="section-label">
                  MASHHUR
                </span>

                <h2>
                  Bugun nima tanlaysiz?
                </h2>

              </div>

              <a href="#menu">
                Barcha mahsulotlar →
              </a>

            </div>


            {/* LOADING */}

            {loading && (

              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "#aaa",
                }}
              >

                <h3>
                  Mahsulotlar
                  yuklanmoqda...
                </h3>

                <p>
                  Bir oz kuting 🔥
                </p>

              </div>

            )}


            {/* ERROR */}

            {error && (

              <div
                style={{
                  textAlign: "center",
                  padding: "50px 20px",
                  color: "#e65a31",
                }}
              >

                <h3>
                  {error}
                </h3>

                <p>
                  Django server
                  ishlayotganini tekshiring.
                </p>

              </div>

            )}


            {/* PRODUCTS */}

            {!loading &&
              !error &&
              products.length > 0 && (

                <div className="product-grid">

                  {products.map((product) => {

                    const imageUrl =
                      getImageUrl(
                        product.image
                      );

                    return (

                      <article
                        className="product-card"
                        key={product.id}
                      >

                        <div
                          className="product-image"
                          style={{
                            height: "300px",
                            overflow: "hidden",
                            position: "relative",
                            background:
                              "#211b19",
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                          }}
                        >

                          {imageUrl ? (

                            <img
                              src={imageUrl}
                              alt={product.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display:
                                  "block",
                              }}
                              onError={(event) => {
                                event.currentTarget.style.display =
                                  "none";
                              }}
                            />

                          ) : (

                            <span
                              style={{
                                fontSize:
                                  "80px",
                              }}
                            >
                              {getProductIcon(
                                product
                                  .category
                                  .name
                              )}
                            </span>

                          )}

                          <button
                            className="favorite"
                            type="button"
                          >
                            ♡
                          </button>

                        </div>


                        <div className="product-content">

                          <h3>
                            {product.name}
                          </h3>

                          <p>
                            {product.description ||
                              "Mazali va sifatli mahsulot."}
                          </p>

                          <div className="product-bottom">

                            <strong>
                              {formatPrice(
                                product.price
                              )}{" "}
                              so‘m
                            </strong>

                            <button
                              className="add-button"
                              type="button"
                              onClick={() =>
                                addToCart(
                                  product
                                )
                              }
                            >
                              +
                            </button>

                          </div>

                        </div>

                      </article>

                    );
                  })}

                </div>

              )}


            {/* EMPTY */}

            {!loading &&
              !error &&
              products.length === 0 && (

                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "#aaa",
                  }}
                >

                  <div
                    style={{
                      fontSize: "50px",
                    }}
                  >
                    🍢
                  </div>

                  <h3>
                    Hozircha mahsulotlar
                    mavjud emas
                  </h3>

                </div>

              )}

          </div>

        </section>


        {/* ================================================= */}
        {/* DELIVERY */}
        {/* ================================================= */}

        <section
          className="delivery"
          id="delivery"
        >

          <div className="container delivery-box">

            <div>

              <span className="section-label">
                YETKAZIB BERISH
              </span>

              <h2>
                Issiq kabob —
                to‘g‘ri uyingizgacha.
              </h2>

              <p>
                Buyurtma bering, manzilingizni
                qoldiring va biz taomingizni
                Uchko‘prik tumani bo‘ylab
                yetkazib beramiz.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  setCartOpen(true)
                }
              >
                Buyurtma berish →
              </button>

            </div>


            <div className="delivery-steps">

              <div className="step">

                <span>
                  01
                </span>

                <div>

                  <strong>
                    Tanlang
                  </strong>

                  <p>
                    Sevimli taomingizni
                    tanlang
                  </p>

                </div>

              </div>


              <div className="step">

                <span>
                  02
                </span>

                <div>

                  <strong>
                    Buyurtma bering
                  </strong>

                  <p>
                    Telefon va manzilingizni
                    kiriting
                  </p>

                </div>

              </div>


              <div className="step">

                <span>
                  03
                </span>

                <div>

                  <strong>
                    Qabul qiling
                  </strong>

                  <p>
                    Buyurtmangizni issiq
                    holda oling
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

      </main>


      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <footer>

        <div className="container footer-content">

          <div className="logo">

            <img
              src="/kabob-logo-header.png"
              alt="Kabob House"
              style={{
                width: "170px",
                height: "auto",
                objectFit: "contain",
              }}
            />

          </div>

          <div className="footer-contact">

            <span>
              📞 Telefon
            </span>

            <strong>
              +998 XX XXX XX XX
            </strong>

          </div>

          <div className="footer-contact">

            <span>
              📍 Hudud
            </span>

            <strong>
              Uchko‘prik tumani
            </strong>

          </div>

        </div>

      </footer>


      {/* ================================================= */}
      {/* SAVAT PANELI */}
      {/* ================================================= */}

      {cartOpen && (

        <>

          <div
            onClick={() =>
              setCartOpen(false)
            }
            style={{
              position: "fixed",
              inset: 0,
              background:
                "rgba(0,0,0,0.7)",
              zIndex: 999,
            }}
          />


          <aside
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "430px",
              maxWidth: "92vw",
              height: "100vh",
              background:
                "#171514",
              borderLeft:
                "1px solid #3a302c",
              zIndex: 1000,
              padding: "25px",
              overflowY: "auto",
              boxShadow:
                "-20px 0 60px rgba(0,0,0,0.5)",
            }}
          >

            {/* CART HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom:
                  "25px",
              }}
            >

              <div>

                <span
                  style={{
                    color:
                      "#ff512f",
                    fontSize:
                      "12px",
                    fontWeight:
                      800,
                    letterSpacing:
                      "2px",
                  }}
                >
                  SAVAT
                </span>

                <h2
                  style={{
                    margin:
                      "5px 0 0",
                    color:
                      "#fff",
                  }}
                >
                  Buyurtmangiz
                </h2>

              </div>


              <button
                type="button"
                onClick={() =>
                  setCartOpen(false)
                }
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius:
                    "12px",
                  border:
                    "1px solid #443a36",
                  background:
                    "#211e1c",
                  color:
                    "#fff",
                  fontSize:
                    "22px",
                  cursor:
                    "pointer",
                }}
              >
                ×
              </button>

            </div>


            {/* EMPTY CART */}

            {cart.length === 0 && (

              <div
                style={{
                  textAlign:
                    "center",
                  padding:
                    "80px 20px",
                  color:
                    "#aaa",
                }}
              >

                <div
                  style={{
                    fontSize:
                      "65px",
                  }}
                >
                  🛒
                </div>

                <h3
                  style={{
                    color:
                      "#fff",
                  }}
                >
                  Savat bo‘sh
                </h3>

                <p>
                  Menyudan mahsulot
                  qo‘shing.
                </p>

              </div>

            )}


            {/* CART ITEMS */}

            {cart.map((item) => {

              const imageUrl =
                getImageUrl(
                  item.product.image
                );

              return (

                <div
                  key={
                    item.product.id
                  }
                  style={{
                    display:
                      "flex",
                    gap: "14px",
                    padding:
                      "15px 0",
                    borderBottom:
                      "1px solid #302925",
                  }}
                >

                  {imageUrl ? (

                    <img
                      src={imageUrl}
                      alt={
                        item.product.name
                      }
                      style={{
                        width: "75px",
                        height: "75px",
                        borderRadius:
                          "12px",
                        objectFit:
                          "cover",
                        background:
                          "#24201e",
                      }}
                    />

                  ) : (

                    <div
                      style={{
                        width:
                          "75px",
                        height:
                          "75px",
                        borderRadius:
                          "12px",
                        background:
                          "#24201e",
                        display:
                          "grid",
                        placeItems:
                          "center",
                        fontSize:
                          "30px",
                      }}
                    >
                      {getProductIcon(
                        item
                          .product
                          .category
                          .name
                      )}
                    </div>

                  )}


                  <div
                    style={{
                      flex: 1,
                    }}
                  >

                    <h4
                      style={{
                        margin:
                          "0 0 7px",
                        color:
                          "#fff",
                      }}
                    >
                      {item.product.name}
                    </h4>

                    <strong
                      style={{
                        color:
                          "#ff512f",
                      }}
                    >
                      {formatPrice(
                        item
                          .product
                          .price
                      )}{" "}
                      so‘m
                    </strong>


                    {/* QUANTITY */}

                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: "10px",
                        marginTop:
                          "10px",
                      }}
                    >

                      <button
                        type="button"
                        onClick={() =>
                          decreaseQuantity(
                            item
                              .product
                              .id
                          )
                        }
                        style={{
                          width:
                            "30px",
                          height:
                            "30px",
                          borderRadius:
                            "8px",
                          border:
                            "1px solid #443a36",
                          background:
                            "#24201e",
                          color:
                            "#fff",
                          cursor:
                            "pointer",
                        }}
                      >
                        −
                      </button>

                      <strong
                        style={{
                          color:
                            "#fff",
                        }}
                      >
                        {item.quantity}
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          increaseQuantity(
                            item
                              .product
                              .id
                          )
                        }
                        style={{
                          width:
                            "30px",
                          height:
                            "30px",
                          borderRadius:
                            "8px",
                          border:
                            "1px solid #443a36",
                          background:
                            "#ff512f",
                          color:
                            "#fff",
                          cursor:
                            "pointer",
                        }}
                      >
                        +
                      </button>


                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(
                            item
                              .product
                              .id
                          )
                        }
                        style={{
                          marginLeft:
                            "auto",
                          border:
                            "none",
                          background:
                            "transparent",
                          color:
                            "#888",
                          cursor:
                            "pointer",
                        }}
                      >
                        O‘chirish
                      </button>

                    </div>

                  </div>

                </div>

              );
            })}


            {/* CART TOTAL */}

            {cart.length > 0 && (

              <div
                style={{
                  marginTop:
                    "30px",
                }}
              >

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    color:
                      "#aaa",
                    marginBottom:
                      "10px",
                  }}
                >

                  <span>
                    Mahsulotlar
                  </span>

                  <strong>
                    {cartCount} ta
                  </strong>

                </div>


                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    color:
                      "#fff",
                    fontSize:
                      "21px",
                    marginBottom:
                      "20px",
                  }}
                >

                  <strong>
                    Jami:
                  </strong>

                  <strong
                    style={{
                      color:
                        "#ff512f",
                    }}
                  >
                    {formatPrice(
                      cartTotal
                    )}{" "}
                    so‘m
                  </strong>

                </div>


                <button
                  type="button"
                  className="primary-button"
                  style={{
                    width:
                      "100%",
                    border:
                      "none",
                    cursor:
                      "pointer",
                  }}
                  onClick={
                    openCheckout
                  }
                >
                  Buyurtma berish →
                </button>


                <button
                  type="button"
                  onClick={
                    clearCart
                  }
                  style={{
                    width:
                      "100%",
                    marginTop:
                      "10px",
                    padding:
                      "12px",
                    border:
                      "1px solid #332d29",
                    borderRadius:
                      "10px",
                    background:
                      "transparent",
                    color:
                      "#888",
                    cursor:
                      "pointer",
                  }}
                >
                  Savatni tozalash
                </button>

              </div>

            )}

          </aside>

        </>

      )}


      {/* ================================================= */}
      {/* CHECKOUT PANEL */}
      {/* ================================================= */}

      {checkoutOpen && (

        <>

          <div
            onClick={() =>
              setCheckoutOpen(
                false
              )
            }
            style={{
              position:
                "fixed",
              inset: 0,
              background:
                "rgba(0,0,0,0.75)",
              zIndex: 1999,
            }}
          />


          <div
            style={{
              position:
                "fixed",
              top: "50%",
              left: "50%",
              transform:
                "translate(-50%, -50%)",
              width: "560px",
              maxWidth:
                "92vw",
              maxHeight:
                "90vh",
              overflowY:
                "auto",
              padding:
                "30px",
              background:
                "#171514",
              border:
                "1px solid #3a302c",
              borderRadius:
                "24px",
              zIndex: 2000,
              boxShadow:
                "0 30px 100px rgba(0,0,0,0.7)",
            }}
          >

            {/* CHECKOUT HEADER */}

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "flex-start",
                marginBottom:
                  "25px",
              }}
            >

              <div>

                <span
                  style={{
                    color:
                      "#ff512f",
                    fontSize:
                      "12px",
                    fontWeight:
                      800,
                    letterSpacing:
                      "2px",
                  }}
                >
                  BUYURTMA
                </span>

                <h2
                  style={{
                    margin:
                      "6px 0",
                    color:
                      "#fff",
                  }}
                >
                  Buyurtmani
                  rasmiylashtirish
                </h2>

                <p
                  style={{
                    margin:
                      0,
                    color:
                      "#888",
                  }}
                >
                  Faqat Uchko‘prik
                  tumani bo‘ylab
                  yetkazib beramiz.
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setCheckoutOpen(
                    false
                  )
                }
                style={{
                  width:
                    "40px",
                  height:
                    "40px",
                  borderRadius:
                    "10px",
                  border:
                    "1px solid #443a36",
                  background:
                    "#211e1c",
                  color:
                    "#fff",
                  fontSize:
                    "21px",
                  cursor:
                    "pointer",
                }}
              >
                ×
              </button>

            </div>


            {/* CHECKOUT FORM */}

            <form
              onSubmit={
                submitOrder
              }
            >

              <label
                style={{
                  display:
                    "block",
                  color:
                    "#ddd",
                  marginBottom:
                    "18px",
                }}
              >

                <span
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "8px",
                  }}
                >
                  Ismingiz
                </span>

                <input
                  type="text"
                  placeholder="Masalan: Muhammad"
                  value={
                    customerName
                  }
                  onChange={(event) =>
                    setCustomerName(
                      event.target
                        .value
                    )
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      "14px",
                    border:
                      "1px solid #3b332f",
                    borderRadius:
                      "10px",
                    background:
                      "#0f0e0d",
                    color:
                      "#fff",
                    outline:
                      "none",
                    fontSize:
                      "15px",
                  }}
                />

              </label>


              <label
                style={{
                  display:
                    "block",
                  color:
                    "#ddd",
                  marginBottom:
                    "18px",
                }}
              >

                <span
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "8px",
                  }}
                >
                  Telefon raqamingiz
                </span>

                <input
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={
                    phone
                  }
                  onChange={(event) =>
                    setPhone(
                      event.target
                        .value
                    )
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      "14px",
                    border:
                      "1px solid #3b332f",
                    borderRadius:
                      "10px",
                    background:
                      "#0f0e0d",
                    color:
                      "#fff",
                    outline:
                      "none",
                    fontSize:
                      "15px",
                  }}
                />

              </label>


              <label
                style={{
                  display:
                    "block",
                  color:
                    "#ddd",
                  marginBottom:
                    "18px",
                }}
              >

                <span
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "8px",
                  }}
                >
                  Yetkazib berish manzili
                </span>

                <textarea
                  placeholder="Uchko‘prik tumani, ko‘cha, uy..."
                  value={
                    address
                  }
                  onChange={(event) =>
                    setAddress(
                      event.target
                        .value
                    )
                  }
                  rows={4}
                  style={{
                    width:
                      "100%",
                    padding:
                      "14px",
                    border:
                      "1px solid #3b332f",
                    borderRadius:
                      "10px",
                    background:
                      "#0f0e0d",
                    color:
                      "#fff",
                    outline:
                      "none",
                    fontSize:
                      "15px",
                    resize:
                      "vertical",
                  }}
                />

              </label>


              {/* ORDER SUMMARY */}

              <div
                style={{
                  padding:
                    "18px",
                  marginBottom:
                    "20px",
                  border:
                    "1px solid #332d29",
                  borderRadius:
                    "14px",
                  background:
                    "#121110",
                }}
              >

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    marginBottom:
                      "10px",
                    color:
                      "#aaa",
                  }}
                >

                  <span>
                    Mahsulotlar
                  </span>

                  <strong
                    style={{
                      color:
                        "#fff",
                    }}
                  >
                    {cartCount} ta
                  </strong>

                </div>


                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    color:
                      "#fff",
                    fontSize:
                      "20px",
                  }}
                >

                  <strong>
                    Jami
                  </strong>

                  <strong
                    style={{
                      color:
                        "#ff512f",
                    }}
                  >
                    {formatPrice(
                      cartTotal
                    )}{" "}
                    so‘m
                  </strong>

                </div>

              </div>


              <button
                type="submit"
                className="primary-button"
                style={{
                  width:
                    "100%",
                  border:
                    "none",
                  cursor:
                    "pointer",
                  fontSize:
                    "16px",
                }}
              >
                ✅ Buyurtmani tasdiqlash
              </button>

            </form>

          </div>

        </>

      )}
    {/* ================================================= */}
{/* DOIMIY SAVAT */}
{/* ================================================= */}

<button
  type="button"
  onClick={() => {
    if (cart.length > 0) {
      setCheckoutOpen(true);
    } else {
      setCartOpen(true);
    }
  }}
  style={{
    position: "fixed",
    right: "25px",
    bottom: "25px",
    zIndex: 1500,

    display: "flex",
    alignItems: "center",
    gap: "12px",

    padding: "14px 20px",

    border: "none",
    borderRadius: "16px",

    background:
      "linear-gradient(135deg, #ff512f, #dd2476)",

    color: "#fff",

    cursor: "pointer",

    boxShadow:
      "0 12px 35px rgba(0, 0, 0, 0.45)",

    fontSize: "15px",
    fontWeight: 700,
  }}
>
  <span
    style={{
      fontSize: "24px",
    }}
  >
    🛒
  </span>

  <span>
    Savat
  </span>

  <span
    style={{
      minWidth: "28px",
      height: "28px",

      display: "flex",
      alignItems: "center",
      justifyContent: "center",

      padding: "0 7px",

      borderRadius: "50%",

      background: "#fff",
      color: "#ff512f",

      fontSize: "13px",
      fontWeight: 900,
    }}
  >
    {cartCount}
  </span>
</button>
    </div>
  );
}

export default App;