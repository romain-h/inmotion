package auth

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

type contextKey string

var userCtxKey = contextKey("userID")

type Claims struct {
	Audience []string `json:"aud,omitempty"`
	jwt.StandardClaims
}

func GetUserID(parsedToken jwt.Token) string {
	return parsedToken.Claims.(*Claims).Subject
}

func FromAuthHeader(r *http.Request) (string, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return "", nil // No error, just no token
	}

	authHeaderParts := strings.Fields(authHeader)
	if len(authHeaderParts) != 2 || strings.ToLower(authHeaderParts[0]) != "bearer" {
		return "", errors.New("Authorization header format must be Bearer {token}")
	}

	return authHeaderParts[1], nil
}

func ValidationKey(token *jwt.Token) (interface{}, error) {
	// Verify 'aud' claim
	aud := os.Getenv("AUTH0_AUDIENCE")
	checkAud := token.Claims.(*Claims).VerifyAudience(aud, false)
	if !checkAud {
		return token, errors.New("Invalid audience.")
	}
	// Verify 'iss' claim
	iss := fmt.Sprintf("https://%s/", os.Getenv("AUTH0_DOMAIN"))
	checkIss := token.Claims.(*Claims).VerifyIssuer(iss, false)
	if !checkIss {
		return token, errors.New("Invalid issuer.")
	}

	cert, err := getPemCert(token)
	if err != nil {
		log.Fatal(err)
	}

	result, _ := jwt.ParseRSAPublicKeyFromPEM([]byte(cert))
	// for k, v := range token.Claims.(*jwt.MapClaims) {
	// fmt.Printf("%s :\t%#v\n", k, v)
	// }
	return result, nil
}

func ParseAndValidateJWT(token string) (*jwt.Token, error) {
	// If the token is empty...
	if token == "" {
		errorMsg := "Required authorization token not found"
		return nil, fmt.Errorf(errorMsg)
	}

	// Now parse the token
	parsedToken, err := jwt.ParseWithClaims(token, &Claims{}, ValidationKey)

	// Check if there was an error in parsing...
	if err != nil {
		log.Fatal(err)
		return nil, fmt.Errorf("Error parsing token: %v", err)
	}

	if jwt.SigningMethodRS256.Alg() != parsedToken.Header["alg"] {
		message := fmt.Sprintf("Expected %s signing method but token specified %s",
			jwt.SigningMethodRS256.Alg(),
			parsedToken.Header["alg"])
		return nil, fmt.Errorf("Error validating token algorithm: %s", message)
	}

	// Check if the parsed token is valid...
	if !parsedToken.Valid {
		return nil, errors.New("Token is invalid")
	}
	return parsedToken, nil
}

func SetUserContext(ctx context.Context, parsedToken jwt.Token) context.Context {
	return context.WithValue(ctx, userCtxKey, GetUserID(parsedToken))
}

func ValidateRequest(w http.ResponseWriter, r *http.Request, tk string) error {
	if r.Method == "OPTIONS" {
		return nil
	}

	var token string
	var err error
	if tk == "" {
		// Use the specified token extractor to extract a token from the request
		token, err = FromAuthHeader(r)
	} else {
		token = tk
	}
	if err != nil {
		return err
	}

	parsedToken, err := ParseAndValidateJWT(token)
	if err != nil {
		return err
	}

	// If we get here, everything worked and we can set the
	// user property in context.
	newRequest := r.WithContext(SetUserContext(r.Context(), *parsedToken))
	// Update the current request with the new context information.
	*r = *newRequest
	return nil
}

func CheckJWT() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := ValidateRequest(c.Writer, c.Request, c.Query("jwt")); err != nil {
			c.AbortWithStatus(401)
		}
		c.Next()
	}
}

func ForContext(ctx context.Context) string {
	raw, _ := ctx.Value(userCtxKey).(string)
	return raw
}
