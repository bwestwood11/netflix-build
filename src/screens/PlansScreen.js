import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectcurrentUser } from "../features/currentUserSlice";
import db from "../firebase";
import "./PlansScreen.css";
import { loadStripe } from "@stripe/stripe-js";

const PlansScreen = () => {
  const [products, setProducts] = useState([]);
  const currentUser = useSelector(selectcurrentUser);
  const [subscription, setSubscription] = useState(null);


  // to check currentUser's subscription role status
  useEffect(() => {
    const getSubscriptions = async () => {
      const ref = collection(db, "customers", currentUser.uid, "subscriptions");
      const snapshot = await getDocs(ref);
      snapshot.forEach((subscription) => {
        setSubscription({
          role: subscription.data().role,
          current_period_end: subscription.data().current_period_end.seconds,
          current_period_start:
            subscription.data().current_period_start.seconds,
        });
      });
      // if (snapshot.empty) {
      //   console.log("no documents exist in the 'subscriptions' subcollection.");
      //   return [];
      // } else {
      //   const subscriptions = snapshot.docs.map((doc) => doc.data());
      //   console.log(
      //     `${subscriptions.length} documents found in the 'subscriptions' subcollection.`
      //   );
      //   return subscriptions;
      // }
    };
    getSubscriptions();
  }, [currentUser]);

  // Code to receive all product product/price information from Stripe
  useEffect(() => {
    const getActiveProducts = async () => {
      let productsCollRef = collection(db, "products");
      let q = query(productsCollRef, where("active", "==", true));

      let querySnapshot = await getDocs(q);
      const products = {};

      for (let i = 0; i < querySnapshot.size; i++) {
        let productDocSnap = querySnapshot.docs[i];
        products[productDocSnap.id] = productDocSnap.data();

        let pricesCollRef = collection(productDocSnap.ref, "prices");
        const pricesSnap = await getDocs(pricesCollRef);

        pricesSnap.docs.forEach((priceDocSnap) => {
          products[productDocSnap.id].prices = {
            priceId: priceDocSnap.id,
            priceData: priceDocSnap.data(),
          };
        });
      }

      setProducts(products);
    };

    getActiveProducts();
  }, []);

  console.log(products);
  console.log(subscription);

  const loadCheckout = async (priceId) => {
    let docRef = await collection(
      db,
      `customers/${currentUser.uid}/checkout_sessions`
    );
    const checkoutSessionRef = await addDoc(docRef, {
      price: priceId,
      success_url: window.location.origin,
      cancel_url: window.location.origin,
    });

    onSnapshot(checkoutSessionRef, async (snap) => {
      const { error, sessionId } = snap.data();
      if (error) {
        alert(`An error-occurred: ${error.message}`);
      }

      if (sessionId) {
        const stripe = await loadStripe(
          "pk_test_51M8z9oAjcsDzDOPsWQFdeE1uapC5UAs11PgxUZ1RjmtfFdcGcVi01TnQDAfPTeoW4W19x1nhnAPdLZqSyxj4PWTr00YLqeoGJ6"
        );
        stripe.redirectToCheckout({ sessionId });
      }
    });
  };

  return (
    <div className="plansScreen">
      <br />
      {subscription && (<p>Renewal Date: {new Date(subscription?.current_period_end * 1000).toLocaleDateString()}</p>)}
      {Object.entries(products).map(([productId, productData]) => {
        // add some logic to check if user's subscription is active...
        const isCurrentPackage = productData.name
          ?.toLowerCase()
          .includes(subscription?.role);
        return (
          <div
            key={productId}
            className={`${
              isCurrentPackage && "plansScreen__plan--disabled"
            } plansScreen__plan`}
          >
            <div className="plansScreen__info">
              <h5>{productData.name}</h5>
              <h6>{productData.description}</h6>
            </div>
            <button
              onClick={() =>
                !isCurrentPackage && loadCheckout(productData.prices.priceId)
              }
            >
              {isCurrentPackage ? "Current Package" : "Subscribe"}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default PlansScreen;
