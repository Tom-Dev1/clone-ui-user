"use client"

import { useEffect, useState, useRef } from "react"
import VietnamLocationService from "@/services/vietnam-location-service"
import type { Districts, Provinces, Wards } from "@/types/location-type"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LocationData {
    provinceId: number | null
    districtId: number | null
    wardId: number | null
    provinceName: string
    districtName: string
    wardName: string
}

interface LocationSelectorProps {
    onLocationChange?: (data: LocationData) => void
    initialValues?: LocationData
    className?: string
}

export function LocationSelector({ onLocationChange, initialValues, className = "" }: LocationSelectorProps) {
    // States for the selected values
    const [formData, setFormData] = useState<LocationData>(
        initialValues || {
            provinceId: null,
            districtId: null,
            wardId: null,
            provinceName: "",
            districtName: "",
            wardName: "",
        },
    )

    // States for the available options
    const [provinces, setProvinces] = useState<Provinces[]>([])
    const [districts, setDistricts] = useState<Districts[]>([])
    const [wards, setWards] = useState<Wards[]>([])

    // Loading states
    const [loadingProvinces, setLoadingProvinces] = useState(true)
    const [loadingDistricts, setLoadingDistricts] = useState(false)
    const [loadingWards, setLoadingWards] = useState(false)

    // Error states
    const [error, setError] = useState<string | null>(null)

    // Use a ref to track if this is an internal update
    const isInternalUpdate = useRef(false)

    // Use a ref to store the previous formData for comparison
    const prevFormDataRef = useRef<LocationData | null>(null)

    // Fetch provinces on component mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                setLoadingProvinces(true)
                setError(null)
                const data = await VietnamLocationService.getProvinces()
                setProvinces(data) // API now returns array directly

                // If we have initial province data, try to find the matching province
                if (initialValues?.provinceName && !initialValues.provinceId) {
                    const matchingProvince = data.find(
                        (p) => p.provinceName.toLowerCase() === initialValues.provinceName.toLowerCase(),
                    )
                    if (matchingProvince) {
                        isInternalUpdate.current = true
                        setFormData((prev) => ({
                            ...prev,
                            provinceId: matchingProvince.provinceId,
                            provinceName: matchingProvince.provinceName,
                        }))
                    }
                }
            } catch (err) {
                setError("Failed to load provinces")
                console.error(err)
            } finally {
                setLoadingProvinces(false)
            }
        }

        fetchProvinces()
    }, [initialValues?.provinceName, initialValues?.provinceId])

    // Fetch districts when province changes
    useEffect(() => {
        const fetchDistricts = async () => {
            if (!formData.provinceId) {
                setDistricts([])
                return
            }

            try {
                setLoadingDistricts(true)
                setError(null)
                const data = await VietnamLocationService.getDistrictsByProvinceId(formData.provinceId)
                setDistricts(data) // API now returns array directly

                // If we have initial district data, try to find the matching district
                if (initialValues?.districtName && !initialValues.districtId && formData.provinceId) {
                    const matchingDistrict = data.find(
                        (d) => d.districtName.toLowerCase() === initialValues.districtName.toLowerCase(),
                    )
                    if (matchingDistrict) {
                        isInternalUpdate.current = true
                        setFormData((prev) => ({
                            ...prev,
                            districtId: matchingDistrict.districtId,
                            districtName: matchingDistrict.districtName,
                        }))
                    }
                }
            } catch (err) {
                setError("Failed to load districts")
                console.error(err)
            } finally {
                setLoadingDistricts(false)
            }
        }

        // Only reset district and ward if provinceId changed and is different from initialValues
        if (!initialValues?.provinceId || formData.provinceId !== initialValues.provinceId) {
            if (formData.districtId !== null || formData.wardId !== null) {
                isInternalUpdate.current = true
                setFormData((prev) => ({
                    ...prev,
                    districtId: null,
                    wardId: null,
                    districtName: "",
                    wardName: "",
                }))
                return // Skip fetching districts if we're resetting
            }
        }

        fetchDistricts()
    }, [formData.provinceId, formData.districtId, formData.wardId, initialValues?.districtId, initialValues?.districtName, initialValues?.provinceId])

    // Fetch wards when district changes
    useEffect(() => {
        const fetchWards = async () => {
            if (!formData.districtId) {
                setWards([])
                return
            }

            try {
                setLoadingWards(true)
                setError(null)
                const data = await VietnamLocationService.getWardsByDistrictId(formData.districtId)
                setWards(data) // API now returns array directly

                // If we have initial ward data, try to find the matching ward
                if (initialValues?.wardName && !initialValues.wardId && formData.districtId) {
                    const matchingWard = data.find((w) => w.wardName.toLowerCase() === initialValues.wardName.toLowerCase())
                    if (matchingWard) {
                        isInternalUpdate.current = true
                        setFormData((prev) => ({
                            ...prev,
                            wardId: matchingWard.wardId,
                            wardName: matchingWard.wardName,
                        }))
                    }
                }
            } catch (err) {
                setError("Failed to load wards")
                console.error(err)
            } finally {
                setLoadingWards(false)
            }
        }

        // Only reset ward if districtId changed and is different from initialValues
        if (!initialValues?.districtId || formData.districtId !== initialValues.districtId) {
            if (formData.wardId !== null) {
                isInternalUpdate.current = true
                setFormData((prev) => ({
                    ...prev,
                    wardId: null,
                    wardName: "",
                }))
                return // Skip fetching wards if we're resetting
            }
        }

        fetchWards()
    }, [formData.districtId, formData.wardId, initialValues?.districtId, initialValues?.wardId, initialValues?.wardName])

    // Notify parent component when location data changes, but only for user-initiated changes
    useEffect(() => {
        // Skip the first render
        if (prevFormDataRef.current === null) {
            prevFormDataRef.current = formData
            return
        }

        // Check if this is an internal update or a user-initiated change
        if (isInternalUpdate.current) {
            isInternalUpdate.current = false
            prevFormDataRef.current = formData
            return
        }

        // Check if there's an actual change in the data
        const prevData = prevFormDataRef.current
        const hasChanged =
            prevData.provinceId !== formData.provinceId ||
            prevData.districtId !== formData.districtId ||
            prevData.wardId !== formData.wardId ||
            prevData.provinceName !== formData.provinceName ||
            prevData.districtName !== formData.districtName ||
            prevData.wardName !== formData.wardName

        // Only notify parent if there's an actual change
        if (hasChanged && onLocationChange) {
            console.log("LocationSelector: Notifying parent with data:", formData)
            onLocationChange(formData)
        }

        // Update the previous data reference
        prevFormDataRef.current = formData
    }, [formData, onLocationChange])

    // Handle province selection
    const handleProvinceChange = (value: string) => {
        if (!value) return

        try {
            const provinceId = Number.parseInt(value, 10)
            if (isNaN(provinceId)) return

            const selectedProvince = provinces.find((p) => p.provinceId === provinceId)

            console.log("Province selected:", selectedProvince?.provinceName)

            setFormData({
                ...formData,
                provinceId,
                provinceName: selectedProvince?.provinceName || "",
                districtId: null,
                wardId: null,
                districtName: "",
                wardName: "",
            })
        } catch (error) {
            console.error("Error in handleProvinceChange:", error)
        }
    }

    // Handle district selection
    const handleDistrictChange = (value: string) => {
        if (!value) return

        try {
            const districtId = Number.parseInt(value, 10)
            if (isNaN(districtId)) return

            const selectedDistrict = districts.find((d) => d.districtId === districtId)

            console.log("District selected:", selectedDistrict?.districtName)

            setFormData({
                ...formData,
                districtId,
                districtName: selectedDistrict?.districtName || "",
                wardId: null,
                wardName: "",
            })
        } catch (error) {
            console.error("Error in handleDistrictChange:", error)
        }
    }

    // Handle ward selection
    const handleWardChange = (value: string) => {
        if (!value) return

        try {
            const wardId = Number.parseInt(value, 10)
            if (isNaN(wardId)) return

            const selectedWard = wards.find((w) => w.wardId === wardId)

            console.log("Ward selected:", selectedWard?.wardName)

            setFormData({
                ...formData,
                wardId,
                wardName: selectedWard?.wardName || "",
            })
        } catch (error) {
            console.error("Error in handleWardChange:", error)
        }
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {error && <div className="bg-red-50 p-3 rounded-md text-red-500 text-sm">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="province">Tỉnh</Label>
                    <Select
                        value={formData.provinceId?.toString() || ""}
                        onValueChange={handleProvinceChange}
                        disabled={loadingProvinces}
                    >
                        <SelectTrigger id="province">
                            <SelectValue placeholder={loadingProvinces ? "Loading provinces..." : "Select a province"} />
                        </SelectTrigger>
                        <SelectContent>
                            {provinces.map((province) => (
                                <SelectItem key={province.provinceId} value={province.provinceId?.toString() || ""}>
                                    {province.provinceName || "Unknown Province"}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                </div>

                <div className="space-y-2">
                    <Label htmlFor="district">Quận/Huyện</Label>
                    <Select
                        value={formData.districtId?.toString() || ""}
                        onValueChange={handleDistrictChange}
                        disabled={loadingDistricts || !formData.provinceId}
                    >
                        <SelectTrigger id="district">
                            <SelectValue
                                placeholder={
                                    loadingDistricts
                                        ? "Loading districts..."
                                        : !formData.provinceId
                                            ? "Select a province first"
                                            : "Select a district"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {districts.map((district) => (
                                <SelectItem key={district.districtId} value={district.districtId?.toString() || ""}>
                                    {district.districtName || "Unknown District"}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                </div>

                <div className="space-y-2">
                    <Label htmlFor="ward">Xã</Label>
                    <Select
                        value={formData.wardId?.toString() || ""}
                        onValueChange={handleWardChange}
                        disabled={loadingWards || !formData.districtId}
                    >
                        <SelectTrigger id="ward">
                            <SelectValue
                                placeholder={
                                    loadingWards ? "Loading wards..." : !formData.districtId ? "Select a district first" : "Select a ward"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {wards.map((ward) => (
                                <SelectItem key={ward.wardId} value={ward.wardId?.toString() || ""}>
                                    {ward.wardName || "Unknown Ward"}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                </div>
            </div>
        </div>
    )
}

