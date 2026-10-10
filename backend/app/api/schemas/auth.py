import re
from datetime import datetime
from typing import Generic, Literal, TypeVar

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: T


class RegisterRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Name must be at least 2 characters.")
        return value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()

    @field_validator("password")
    @classmethod
    def enforce_password_policy(cls, value: str) -> str:
        if not re.search(r"[A-Z]", value) or not re.search(r"[0-9]", value):
            raise ValueError("Password must contain an uppercase letter and a number.")
        return value


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()


class RefreshRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    refresh_token: str = Field(alias="refreshToken", min_length=1)


class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    avatar_url: str | None = Field(default=None, serialization_alias="avatarUrl")
    is_email_verified: bool = Field(serialization_alias="isEmailVerified")
    role: Literal["farmer", "admin"] = "farmer"
    created_at: datetime = Field(serialization_alias="createdAt")


class TokenPair(BaseModel):
    access_token: str = Field(serialization_alias="accessToken")
    refresh_token: str = Field(serialization_alias="refreshToken")


class AuthSession(BaseModel):
    user: UserProfile
    tokens: TokenPair