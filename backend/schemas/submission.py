from pydantic import BaseModel, Field


class PresignedUrlRequest(BaseModel):
    verification_token: str
    team_no: str
    team_name: str


class ProposalSubmission(BaseModel):
    verification_token: str
    youtube_url: str = Field(
        ..., pattern=r"^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$"
    )
    team_no: str
    team_name: str
    file_key: str
